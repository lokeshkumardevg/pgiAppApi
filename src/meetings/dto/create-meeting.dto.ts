import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  @IsOptional()
  prospectId?: string;

  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsNotEmpty()
  contact: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  associateName?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  project?: string;

  @IsString()
  @IsOptional()
  meetingPlace?: string;

  @IsBoolean()
  @IsOptional()
  meetingAttempted?: boolean;

  @IsString()
  @IsOptional()
  budget?: string;

  @IsString()
  @IsOptional()
  doneBy?: string;

  @IsBoolean()
  @IsOptional()
  visit?: boolean;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  obStatus?: string;

  @IsString()
  @IsOptional()
  expectedClosureDate?: string;
}
