import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('api/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @Get('categories')
  findCategories() {
    return this.servicesService.findCategories();
  }

  @Get('category/:slug')
  findByCategory(@Param('slug') slug: string) {
    return this.servicesService.findByCategory(slug);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const service = await this.servicesService.findBySlug(slug);
    if (!service) throw new NotFoundException(`Không tìm thấy dịch vụ "${slug}"`);
    return service;
  }
}

@Controller('api/admin/services')
@Auth('admin.access', 'services.manage')
export class AdminServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  list() {
    return this.servicesService.adminList();
  }

  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
