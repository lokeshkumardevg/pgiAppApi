import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsNotEmpty()
  project: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsNotEmpty()
  unitType: string;

  @IsString()
  @IsNotEmpty()
  unitNo: string;

  @IsString()
  @IsNotEmpty()
  contactNo: string;

  @IsString()
  @IsNotEmpty()
  brokerName: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  price?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  createdBy?: string;
}

export class UpdateInventoryDto {
  @IsString()
  @IsOptional()
  size?: string;

  @IsString()
  @IsOptional()
  project?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  unitType?: string;

  @IsString()
  @IsOptional()
  unitNo?: string;

  @IsString()
  @IsOptional()
  contactNo?: string;

  @IsString()
  @IsOptional()
  brokerName?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  price?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
