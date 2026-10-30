import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { AdminServicesController, ServicesController } from './services.controller';

@Module({
  controllers: [ServicesController, AdminServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
