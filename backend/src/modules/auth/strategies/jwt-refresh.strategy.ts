import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { createHash } from "crypto";
import { PrismaService } from "../../../infra/prisma/prisma.service";
import type { JwtPayload } from "../../../common/decorators/current-user.decorator";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField("refreshToken"),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: config.getOrThrow<string>("JWT_REFRESH_SECRET"),
    });
  }

  async validate(req: Request & { body: { refreshToken: string } }, payload: JwtPayload): Promise<JwtPayload & { refreshToken: string }> {
    const raw = req.body.refreshToken;
    const tokenHash = createHash("sha256").update(raw).digest("hex");

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token is invalid or expired");
    }

    return { ...payload, refreshToken: raw };
  }
}
