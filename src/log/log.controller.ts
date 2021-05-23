import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Log } from "./log.entity"
import { LogService } from './log.service';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/services/guard/role.decorator';
import RoleType from "../services/guard/roles"
import { AuthGuard } from 'src/services/guard/auth.guard';
import axios from "axios"
@Crud({
    model: {
        type: Log
    },
    routes: {
        getManyBase: { decorators: [Roles([RoleType.SUPER_ADMIN, RoleType.ADMIN])] },
        getOneBase: { decorators: [Roles([RoleType.SUPER_ADMIN, RoleType.ADMIN])] },
        deleteOneBase: { decorators: [Roles([RoleType.SUPER_ADMIN])] },
    },
})
@ApiTags('Logger')
@UseGuards(AuthGuard)
@Controller('log')
export class LogController {
    constructor(
        private service: LogService
    ) { }

    @Get('/trigger/:popId')
    async triggerLog(@Param('popId', ParseIntPipe) popId: number) {
        return this.service.triggerLog(popId);
    }
    @Get('/ip-address/:ip')
    async trackingIp(@Req() req) {
        const apiUrl = `http://ip-api.com/json/${req.params.ip}`;
        let apiInfo = await axios.get(apiUrl)
        return apiInfo.data;
    }
}
