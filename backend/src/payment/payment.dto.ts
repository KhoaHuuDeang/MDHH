import { IsString, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  payment_method: string;
}

export class ViettelPayCallbackDto {
  @IsString()
  order_id: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  payment_ref?: string;
}

// VNPay callback uses query parameters, no DTO validation needed
