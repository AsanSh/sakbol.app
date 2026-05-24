import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, IsNotEmpty } from "class-validator";
import { OtpChannel } from "@prisma/client";

export class SendOtpDto {
  @ApiProperty({ enum: OtpChannel, example: OtpChannel.EMAIL })
  @IsEnum(OtpChannel)
  channel!: OtpChannel;

  @ApiProperty({ example: "aibek@example.com", description: "Email или E.164 телефон" })
  @IsString()
  @IsNotEmpty()
  recipient!: string;
}
