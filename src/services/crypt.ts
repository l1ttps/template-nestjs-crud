import { Injectable } from "@nestjs/common";
import * as fernet from 'fernet';

@Injectable()
export class Crypto {
    constructor() {}
    
    private key = new fernet.Secret(process.env.KEYCRYPT);

    private encrypt = new fernet.Token({
        secret: this.key,
        time: Date.parse('1'),
        iv: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    });

    encryptData(data: string): string {
        return this.encrypt.encode(data)
    }

    decryptData(encrypt: string): string {
        const decrypt = new fernet.Token({
            secret: this.key,
            ttl: 0
        });
        decrypt.token = encrypt;
        return decrypt.decode();
    }


    
}