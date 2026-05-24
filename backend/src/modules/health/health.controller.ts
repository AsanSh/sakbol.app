import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";

import { PrismaService } from "../../infra/prisma/prisma.service";

@ApiTags("system")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "Health check (DB ping)" })
  async health(): Promise<{ ok: true; service: string; db: "ok" | "down"; ts: string }> {
    let db: "ok" | "down" = "down";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = "ok";
    } catch {
      /* keep down */
    }
    return {
      ok: true,
      service: "sakbol-backend",
      db,
      ts: new Date().toISOString(),
    };
  }
}
