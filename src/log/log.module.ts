import { Module } from '@nestjs/common';
import { LogController } from './log.controller';
import { LogService } from './log.service';
import {LogRepository} from "./log.repositoty"
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramService } from 'src/services/telegram.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogRepository]),
  ],
  controllers: [LogController],
  providers: [
    LogService,
    TelegramService,
  ],
  exports: [LogService],
})
export class LogModule {}
