import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

export interface JwtPayload {
  sub: string;
  email?: string;
  phone?: string;
  iat?: number;
  exp?: number;
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtPayload => {
    const req = ctx.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    return req.user;
  },
);
