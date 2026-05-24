import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infra/prisma/prisma.service";
import type { UpdateProfileDto } from "./dto/update-profile.dto";

const PROFILE_SELECT = {
  id: true,
  displayName: true,
  email: true,
  phoneE164: true,
  avatarUrl: true,
  biologicalSex: true,
  dateOfBirth: true,
  heightCm: true,
  weightKg: true,
  bloodType: true,
  familyRole: true,
  familyId: true,
  medCardIsDoctor: true,
  medCardIsCaregiver: true,
  createdAt: true,
} as const;

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id, deletedAt: null },
      select: PROFILE_SELECT,
    });
    if (!profile) throw new NotFoundException("Profile not found");
    return profile;
  }

  async update(id: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!profile) throw new NotFoundException("Profile not found");

    return this.prisma.profile.update({
      where: { id },
      data: {
        ...(dto.displayName && { displayName: dto.displayName }),
        ...(dto.biologicalSex && { biologicalSex: dto.biologicalSex }),
        ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
        ...(dto.heightCm !== undefined && { heightCm: dto.heightCm }),
        ...(dto.weightKg !== undefined && { weightKg: dto.weightKg }),
        ...(dto.bloodType !== undefined && { bloodType: dto.bloodType }),
        ...(dto.phoneE164 !== undefined && { phoneE164: dto.phoneE164 }),
      },
      select: PROFILE_SELECT,
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.profile.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
