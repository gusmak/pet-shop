import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { BookingsModule } from './bookings/bookings.module';
import { ContactModule } from './contact/contact.module';
import { PostsModule } from './posts/posts.module';
import { StaffModule } from './staff/staff.module';
import { CustomersModule } from './customers/customers.module';
import { GroupsModule } from './groups/groups.module';
import { StatsModule } from './stats/stats.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ServicesModule,
    BookingsModule,
    ContactModule,
    PostsModule,
    StaffModule,
    CustomersModule,
    GroupsModule,
    StatsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
