import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BiologicalSex, ManagedRelationRole } from "@prisma/client";
import { IsEnum, IsISO8601, IsOptional, IsString, IsNotEmpty } from "class-validator";

export class AddMemberDto {
  @ApiProperty({ example: "Акмарал Орозова" })
  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @ApiPropertyOptional({ enum: ManagedRelationRole })
  @IsOptional()
  @IsEnum(ManagedRelationRole)
  managedRole?: ManagedRelationRole;

  @ApiPropertyOptional({ enum: BiologicalSex })
  @IsOptional()
  @IsEnum(BiologicalSex)
  biologicalSex?: BiologicalSex;

  @ApiPropertyOptional({ example: "2015-03-10" })
  @IsOptional()
  @IsISO8601()
  dateOfBirth?: string;
}
