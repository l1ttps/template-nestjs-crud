import { Controller, Get, Head, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import * as os from 'os';
import { AuthGuard } from './services/guard/auth.guard';
import { Roles } from './services/guard/role.decorator';
@UseGuards(AuthGuard)
@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getUptime(@Res() res, @Req() req): object {
    return res.json({ uptime: process.uptime() });
  }

  @Roles([])
  @Head('/ping')
  ping(@Res() res, @Req() req) {
    return res.json({});
  }
}
