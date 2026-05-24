import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class InviteDto {
  @ApiProperty({ example: "guest@example.com", description: "Email приглашённого" })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: "+996700123456", description: "Телефон приглашённого (E.164)" })
  @IsString()
  @IsOptional()
  phoneE164?: string;
}
