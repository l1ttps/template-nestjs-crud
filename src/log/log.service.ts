import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Log } from "./log.entity"
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { LogType } from './log_type.enum';
// import { TelegramService } from 'src/services/telegram.service';

@Injectable()
export class LogService extends TypeOrmCrudService<Log>  {
    constructor(
        @InjectRepository(Log) repo,
        // private tele: TelegramService
    ) {
        super(repo)
    }

    async createLog(logdata: any): Promise<void> {
        // await this.tele.telegramSendMessage(JSON.stringify(logdata));
        await this.repo.save(logdata)
    }

    async triggerLog(popId: number): Promise<Log[]> {
        let logs = await this.repo.find({
            type: LogType.TRIGGER
        });
        return logs;
    }

    async getIp4Log(req): Promise<string> {
        const header = req.headers;
        let ipAddress = req.ip;
        if (ipAddress.includes('::1')) {
            ipAddress = 'localhost';
        }
        return header['cf-connecting-ipv6'] ? header['cf-connecting-ipv6'] : header['cf-connecting-ip'] ? header['cf-connecting-ip'] : ipAddress;
    }
}
