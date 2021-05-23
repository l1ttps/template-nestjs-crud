import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {

    constructor() {}

    private TOKEN = process.env.TELEGRAM_TOKEN;
    private CHATID = process.env.TELEGRAM_CHATID;

    private bot = new TelegramBot(this.TOKEN, {polling: false});

    async telegramSendMessage(message) {
        this.bot.sendMessage(this.CHATID, message);
    }

    async telegramSwitchReq(code) {
        const content = `Yêu cầu đóng cắt tủ điện, mã xác thực của bạn là: ${code}`;
        this.telegramSendMessage(content);
    }

    async telegramPwdCreateAccount(account, pwd) {
        const content = `Tài khoản "${account}" đã tạo thành công với mật khẩu là: "${pwd}"`;
        this.telegramSendMessage(content);
    }

}
