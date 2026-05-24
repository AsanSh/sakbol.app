import { ApiPropertyOptional } from "@nestjs/swagger";
import { BiologicalSex } from "@prisma/client";
import { IsEnum, IsISO8601, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "Айбек Орозов" })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ enum: BiologicalSex })
  @IsOptional()
  @IsEnum(BiologicalSex)
  biologicalSex?: BiologicalSex;

  @ApiPropertyOptional({ example: "1990-05-15" })
  @IsOptional()
  @IsISO8601()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 175 })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(250)
  heightCm?: number;

  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  weightKg?: number;

  @ApiPropertyOptional({ example: "A+" })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiPropertyOptional({ example: "+996700123456" })
  @IsOptional()
  @IsString()
  phoneE164?: string;
}
