import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { OtpChannel } from "@prisma/client";
import * as argon2 from "argon2";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { AuditService } from "../../infra/audit/audit.service";
import type { JwtPayload } from "../../common/decorators/current-user.decorator";
import type { RegisterDto } from "./dto/register.dto";
import type { LoginDto } from "./dto/login.dto";

const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  // ── Register ────────────────────────────────────────────────────────────

  async register(dto: RegisterDto, meta: { ip?: string; ua?: string } = {}): Promise<AuthTokens> {
    const existing = await this.prisma.profile.findFirst({
      where: { email: dto.email, deletedAt: null },
    });
    if (existing) throw new ConflictException("Email уже занят");

    const passwordHash = await argon2.hash(dto.password);

    const profile = await this.prisma.$transaction(async (tx) => {
      const family = await tx.family.create({ data: {} });
      return tx.profile.create({
        data: {
          familyId: family.id,
          displayName: dto.displayName,
          email: dto.email,
          phoneE164: dto.phoneE164,
          passwordHash,
          familyRole: "ADMIN",
        },
      });
    });

    await this.audit.log({
      actorProfileId: profile.id,
      action: "auth.register",
      ipAddress: meta.ip,
      userAgent: meta.ua,
    });

    return this.issueTokens(profile.id, profile.email ?? undefined, meta);
  }

  // ── Login ────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, meta: { ip?: string; ua?: string } = {}): Promise<AuthTokens> {
    const isEmail = dto.identifier.includes("@");
    const profile = await this.prisma.profile.findFirst({
      where: {
        deletedAt: null,
        ...(isEmail ? { email: dto.identifier } : { phoneE164: dto.identifier }),
      },
    });

    if (!profile?.passwordHash) throw new UnauthorizedException("Неверный логин или пароль");

    const ok = await argon2.verify(profile.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException("Неверный логин или пароль");

    await this.audit.log({ actorProfileId: profile.id, action: "auth.login", ...meta });

    return this.issueTokens(profile.id, profile.email ?? undefined, meta);
  }

  // ── Refresh ──────────────────────────────────────────────────────────────

  async refresh(
    profileId: string,
    oldRawToken: string,
    meta: { ip?: string; ua?: string } = {},
  ): Promise<AuthTokens> {
    const oldHash = createHash("sha256").update(oldRawToken).digest("hex");

    await this.prisma.refreshToken.update({
      where: { tokenHash: oldHash },
      data: { revokedAt: new Date() },
    });

    const profile = await this.prisma.profile.findUniqueOrThrow({
      where: { id: profileId },
      select: { id: true, email: true },
    });

    return this.issueTokens(profile.id, profile.email ?? undefined, meta);
  }

  // ── Logout ───────────────────────────────────────────────────────────────

  async logout(profileId: string, rawToken: string): Promise<void> {
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    await this.prisma.refreshToken
      .update({ where: { tokenHash }, data: { revokedAt: new Date() } })
      .catch(() => {/* token may already be gone */});
    await this.audit.log({ actorProfileId: profileId, action: "auth.logout" });
  }

  // ── OTP ──────────────────────────────────────────────────────────────────

  async sendOtp(channel: OtpChannel, recipient: string): Promise<void> {
    const code = Math.floor(100_000 + Math.random() * 900_000).toString();
    const codeHash = createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await this.prisma.otpChallenge.create({ data: { channel, recipient, codeHash, expiresAt } });

    // TODO: plug in SMTP/SMS provider here.
    this.logger.log(`OTP for ${channel}:${recipient} → ${code}`);
  }

  async verifyOtp(channel: OtpChannel, recipient: string, code: string): Promise<boolean> {
    const codeHash = createHash("sha256").update(code).digest("hex");
    const challenge = await this.prisma.otpChallenge.findFirst({
      where: {
        channel,
        recipient,
        codeHash,
        consumedAt: null,
        expiresAt: { gt: new Date() },
        attempts: { lt: OTP_MAX_ATTEMPTS },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!challenge) {
      await this.prisma.otpChallenge.updateMany({
        where: { channel, recipient, consumedAt: null, expiresAt: { gt: new Date() } },
        data: { attempts: { increment: 1 } },
      });
      return false;
    }

    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });
    return true;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private async issueTokens(
    profileId: string,
    email: string | undefined,
    meta: { ip?: string; ua?: string },
  ): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: profileId, email };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      expiresIn: this.config.get<string>("JWT_ACCESS_EXPIRES_IN") ?? "15m",
    });

    const rawRefresh = randomBytes(40).toString("hex");
    const tokenHash = createHash("sha256").update(rawRefresh).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        profileId,
        tokenHash,
        expiresAt,
        ipAddress: meta.ip,
        userAgent: meta.ua,
      },
    });

    return { accessToken, refreshToken: rawRefresh };
  }
}
