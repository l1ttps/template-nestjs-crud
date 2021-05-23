import { Controller, Get, Res } from '@nestjs/common';
import { Roles } from "./roles.entity"
import { Crud } from '@nestjsx/crud';
import { ApiTags } from '@nestjs/swagger';
import { RolesService } from "./roles.service";
import SimpleCrypto from "simple-crypto-js";

@ApiTags('Roles')
@Controller('r')
export class RolesController {
    constructor(private service: RolesService) {

    }
    @Get("/")
    async getRoles() {
        const roles = (await this.service.find()).map(r => {
            return {
                id: r.id,
                name: r.name,
                key: r.key
            }
        });
        const rolesToString = JSON.stringify(roles);
        const _secretKey = process.env.SERECT_KEY;
        const simpleCrypto = new SimpleCrypto(_secretKey);
        const plainText = rolesToString;
        const cipherText = simpleCrypto.encrypt(plainText);
        return cipherText;
    }
}
