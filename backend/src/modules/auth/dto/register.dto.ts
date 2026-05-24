import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "Айбек Орозов" })
  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @ApiProperty({ example: "aibek@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "SecurePass123" })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: "+996700123456" })
  @IsOptional()
  @IsString()
  phoneE164?: string;
}
