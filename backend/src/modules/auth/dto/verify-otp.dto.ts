import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, IsNotEmpty, Length } from "class-validator";
import { OtpChannel } from "@prisma/client";

export class VerifyOtpDto {
  @ApiProperty({ enum: OtpChannel })
  @IsEnum(OtpChannel)
  channel!: OtpChannel;

  @ApiProperty({ example: "aibek@example.com" })
  @IsString()
  @IsNotEmpty()
  recipient!: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @Length(6, 6)
  code!: string;
}
