import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ProfileService } from "./profile.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { CurrentUser, type JwtPayload } from "../../common/decorators/current-user.decorator";

@ApiTags("profile")
@ApiBearerAuth()
@Controller("profile")
export class ProfileController {
  constructor(private readonly profiles: ProfileService) {}

  @Get("me")
  @ApiOperation({ summary: "Текущий профиль" })
  getMe(@CurrentUser() user: JwtPayload) {
    return this.profiles.findById(user.sub);
  }

  @Patch("me")
  @ApiOperation({ summary: "Обновить данные профиля" })
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.profiles.update(user.sub, dto);
  }

  @Delete("me")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Мягкое удаление аккаунта" })
  deleteMe(@CurrentUser() user: JwtPayload) {
    return this.profiles.softDelete(user.sub);
  }
}
