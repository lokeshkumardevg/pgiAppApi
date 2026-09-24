import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateProspectDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsNotEmpty()
  contact: string;

  @IsString()
  @IsOptional()
  type?: string; // Hot, Warm, Cold, Not Interested

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  associateName?: string;

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
  initialRemark?: string;

  @IsBoolean()
  @IsOptional()
  meetingAttempted?: boolean;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  dataSource?: string;

  @IsString()
  @IsOptional()
  dealValue?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
