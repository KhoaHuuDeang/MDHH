import { IsString, IsInt, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  souvenir_id: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  quantity: number;
}
