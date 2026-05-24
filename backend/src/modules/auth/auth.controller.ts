import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { SendOtpDto } from "./dto/send-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser, type JwtPayload } from "../../common/decorators/current-user.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Регистрация нового пользователя (email + пароль)" })
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.auth.register(dto, { ip: req.ip, ua: req.headers["user-agent"] });
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Вход по email/телефону + пароль" })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto, { ip: req.ip, ua: req.headers["user-agent"] });
  }

  @Public()
  @UseGuards(AuthGuard("jwt-refresh"))
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Обновление access token через refresh token" })
  refresh(
    @Body() dto: RefreshTokenDto,
    @CurrentUser() user: JwtPayload & { refreshToken: string },
    @Req() req: Request,
  ) {
    return this.auth.refresh(user.sub, dto.refreshToken, { ip: req.ip, ua: req.headers["user-agent"] });
  }

  @ApiBearerAuth()
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Выход — инвалидация refresh token" })
  logout(@CurrentUser() user: JwtPayload, @Body() dto: RefreshTokenDto) {
    return this.auth.logout(user.sub, dto.refreshToken);
  }

  @Public()
  @Post("otp/send")
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: "Отправить OTP-код на email или телефон" })
  sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto.channel, dto.recipient);
  }

  @Public()
  @Post("otp/verify")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Проверить OTP-код" })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.channel, dto.recipient, dto.code);
  }
}
