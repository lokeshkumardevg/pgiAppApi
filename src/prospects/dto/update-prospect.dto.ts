import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateProspectDto {
  @IsString()
  @IsOptional()
  clientName?: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  budget?: string;

  @IsString()
  @IsOptional()
  project?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  occupation?: string;

  @IsString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  timing?: string;

  @IsString()
  @IsOptional()
  purpose?: string;

  @IsString()
  @IsOptional()
  newRemark?: string;

  @IsBoolean()
  @IsOptional()
  meetingAttempted?: boolean;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  associateName?: string;

  @IsString()
  @IsOptional()
  dealValue?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
