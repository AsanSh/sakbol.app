import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FamilyService } from "./family.service";
import { AddMemberDto } from "./dto/add-member.dto";
import { InviteDto } from "./dto/invite.dto";
import { CurrentUser, type JwtPayload } from "../../common/decorators/current-user.decorator";

@ApiTags("family")
@ApiBearerAuth()
@Controller("family")
export class FamilyController {
  constructor(private readonly family: FamilyService) {}

  @Get()
  @ApiOperation({ summary: "Моя семья со списком участников" })
  getMyFamily(@CurrentUser() user: JwtPayload) {
    return this.family.getMyFamily(user.sub);
  }

  @Post("members")
  @ApiOperation({ summary: "Добавить управляемого участника (ребёнок/пожилой)" })
  addMember(@CurrentUser() user: JwtPayload, @Body() dto: AddMemberDto) {
    return this.family.addMember(user.sub, dto);
  }

  @Delete("members/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Удалить участника из семьи (soft-delete)" })
  removeMember(@CurrentUser() user: JwtPayload, @Param("id") memberId: string) {
    return this.family.removeMember(user.sub, memberId);
  }

  @Post("invites")
  @ApiOperation({ summary: "Пригласить пользователя по email или телефону" })
  invite(@CurrentUser() user: JwtPayload, @Body() dto: InviteDto) {
    return this.family.inviteMember(user.sub, dto);
  }

  @Post("invites/:token/accept")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Принять приглашение по токену" })
  acceptInvite(@CurrentUser() user: JwtPayload, @Param("token") token: string) {
    return this.family.acceptInvite(user.sub, token);
  }
}
