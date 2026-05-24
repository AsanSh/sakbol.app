import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { FamilyRole } from "@prisma/client";
import { randomBytes } from "crypto";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { AuditService } from "../../infra/audit/audit.service";
import type { AddMemberDto } from "./dto/add-member.dto";
import type { InviteDto } from "./dto/invite.dto";

@Injectable()
export class FamilyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getMyFamily(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId, deletedAt: null },
      select: { familyId: true, familyRole: true },
    });
    if (!profile) throw new NotFoundException("Profile not found");

    return this.prisma.family.findUniqueOrThrow({
      where: { id: profile.familyId },
      include: {
        profiles: {
          where: { deletedAt: null },
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            familyRole: true,
            managedRole: true,
            biologicalSex: true,
            dateOfBirth: true,
            isManaged: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  async addMember(actorId: string, dto: AddMemberDto) {
    const actor = await this.requireAdmin(actorId);

    const member = await this.prisma.profile.create({
      data: {
        familyId: actor.familyId,
        displayName: dto.displayName,
        managedRole: dto.managedRole,
        biologicalSex: dto.biologicalSex,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        familyRole: FamilyRole.MEMBER,
        isManaged: true,
      },
      select: { id: true, displayName: true, familyRole: true, managedRole: true },
    });

    await this.audit.log({ actorProfileId: actorId, action: "family.addMember", targetId: member.id });
    return member;
  }

  async inviteMember(actorId: string, dto: InviteDto) {
    if (!dto.email && !dto.phoneE164) {
      throw new BadRequestException("email или phoneE164 обязателен");
    }
    const actor = await this.requireAdmin(actorId);

    const inviteCode9 = randomBytes(5).toString("hex").slice(0, 9).toUpperCase();
    const inviteToken = randomBytes(20).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const access = await this.prisma.profileAccess.create({
      data: {
        sourceProfileId: actorId,
        pendingEmail: dto.email,
        pendingPhoneE164: dto.phoneE164,
        inviteToken,
        inviteCode9,
        inviteExpiresAt: expiresAt,
      },
      select: { id: true, inviteCode9: true, inviteToken: true, inviteExpiresAt: true },
    });

    await this.audit.log({
      actorProfileId: actorId,
      action: "family.invite",
      meta: { familyId: actor.familyId },
    });

    return access;
  }

  async acceptInvite(profileId: string, token: string) {
    const access = await this.prisma.profileAccess.findUnique({
      where: { inviteToken: token },
    });

    if (!access || access.revokedAt || (access.inviteExpiresAt && access.inviteExpiresAt < new Date())) {
      throw new BadRequestException("Приглашение недействительно или истекло");
    }
    if (access.acceptedAt) throw new BadRequestException("Приглашение уже использовано");

    await this.prisma.profileAccess.update({
      where: { id: access.id },
      data: { granteeProfileId: profileId, acceptedAt: new Date() },
    });

    await this.audit.log({ actorProfileId: profileId, action: "family.acceptInvite" });
  }

  async removeMember(actorId: string, memberId: string) {
    const actor = await this.requireAdmin(actorId);

    const member = await this.prisma.profile.findUnique({
      where: { id: memberId, familyId: actor.familyId, deletedAt: null },
      select: { id: true, familyRole: true },
    });
    if (!member) throw new NotFoundException("Member not found in your family");
    if (member.familyRole === FamilyRole.ADMIN) throw new ForbiddenException("Cannot remove admin");

    await this.prisma.profile.update({ where: { id: memberId }, data: { deletedAt: new Date() } });
    await this.audit.log({ actorProfileId: actorId, action: "family.removeMember", targetId: memberId });
  }

  // ── helpers ────────────────────────────────────────────────────────────

  private async requireAdmin(profileId: string) {
    const p = await this.prisma.profile.findUnique({
      where: { id: profileId, deletedAt: null },
      select: { familyId: true, familyRole: true },
    });
    if (!p) throw new NotFoundException("Profile not found");
    if (p.familyRole !== FamilyRole.ADMIN) throw new ForbiddenException("Only admin can do this");
    return p;
  }
}
