import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from './account/account.module';
import { SendMailService } from './services/send-mail/send-mail/send-mail.service';
import { ConfigModule } from '@nestjs/config';
import { AppGateway } from './app.gateway';
import { EventsModule } from './services/events/events.module';
import { LogModule } from './log/log.module';
import { RoleModule } from './roles/roles.module';
import { TelegramService } from './services/telegram.service';
import { RedisService } from './services/caching/redis/redis.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        __dirname + '/**/*.entity.{js,ts}'
      ],
      keepConnectionAlive: true,
      synchronize: true,
    }),
    AccountModule,
    EventsModule,
    LogModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [AppService, SendMailService, AppGateway, TelegramService, RedisService],
})
export class AppModule { }
