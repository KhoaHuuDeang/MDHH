import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateSouvenirDto, UpdateSouvenirDto } from './shop.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('shop')
export class ShopController {
  constructor(private shopService: ShopService) {}

  @Get('souvenirs')
  async getAllSouvenirs(@Query('active') active?: string) {
    const isActive = active === 'true' ? true : active === 'false' ? false : undefined;
    return this.shopService.getAllSouvenirs(isActive);
  }

  @Get('souvenirs/:id')
  async getSouvenirById(@Param('id') id: string) {
    return this.shopService.getSouvenirById(id);
  }

  @Post('souvenirs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createSouvenir(@Body() dto: CreateSouvenirDto) {
    return this.shopService.createSouvenir(dto);
  }

  @Put('souvenirs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateSouvenir(@Param('id') id: string, @Body() dto: UpdateSouvenirDto) {
    return this.shopService.updateSouvenir(id, dto);
  }

  @Delete('souvenirs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteSouvenir(@Param('id') id: string) {
    return this.shopService.deleteSouvenir(id);
  }
}
