import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "aibek@example.com", description: "Email или номер телефона E.164" })
  @IsString()
  @IsNotEmpty()
  identifier!: string;

  @ApiProperty({ example: "SecurePass123" })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
