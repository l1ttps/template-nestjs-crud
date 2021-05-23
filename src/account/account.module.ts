import { Module, Global } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountRepository } from "./account.repository"
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './account.controller';
import { LogModule } from 'src/log/log.module';
import { RoleModule } from 'src/roles/roles.module';
import { RolesRepository } from 'src/roles/roles.repository';
import { SendMailService } from 'src/services/send-mail/send-mail/send-mail.service';
import { RedisService } from 'src/services/caching/redis/redis.service';


@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([AccountRepository, RolesRepository]),
        LogModule,
        RoleModule,
        SendMailService,
        RedisService
    ],
    controllers: [AccountController],
    providers: [AccountService, SendMailService, RedisService],
    exports: [AccountService]
})
export class AccountModule { }
