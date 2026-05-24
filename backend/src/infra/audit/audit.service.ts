import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

interface AuditParams {
  actorProfileId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  meta?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: AuditParams): Promise<void> {
    await this.prisma.auditLog.create({ data: { ...params, meta: params.meta as object | undefined } }).catch(() => {
      // Audit failures must not break the main request flow.
    });
  }
}
