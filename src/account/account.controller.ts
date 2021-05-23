import {
  Controller,
  Post,
  ValidationPipe,
  Body,
  UseGuards,
  SetMetadata,
  Req,
  Headers,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Account } from './account.entity';
import {
  Crud,
  CrudController,
  Override,
  ParsedRequest,
  CrudRequest,
} from '@nestjsx/crud';
import { AccountService } from './account.service';
import { AccountDto, ChangPassword, SignInDto } from './acccount.dto';
import { AuthGuard } from '../services/guard/auth.guard';
import { Roles } from 'src/services/guard/role.decorator';
import RoleType from '../services/guard/roles';
import { AccountRepository } from './account.repository';
import roles from '../services/guard/roles';
import JWT from '../services/jwt-passport';
import { RolesRepository } from 'src/roles/roles.repository';
import { SendMailService } from 'src/services/send-mail/send-mail/send-mail.service';
import * as randToken from 'rand-token';

@Crud({
  model: {
    type: Account,
  },
  query: {
    exclude: ['password', 'salt', "secretKeyJwt"],
  },
  routes: {
    createOneBase: {
      decorators: [
        Roles([RoleType.SUPER_ADMIN]),
      ],
    },
    getOneBase: {
      decorators: [Roles([])]
    },
    deleteOneBase: {
      decorators: [
        Roles([RoleType.SUPER_ADMIN]),
      ],
    },
  },
})
@Controller('account')
@UseGuards(AuthGuard)
@ApiTags('Accounts')
export class AccountController {
  constructor(
    public service: AccountService,
    private accountRepo: AccountRepository,
    private rolesRepo: RolesRepository,
    private sgMail: SendMailService,
  ) { }

  @Post('/signup')
  @SetMetadata('GUARD_IGNORED', true)
  signUp(@Body(ValidationPipe) accountDto: AccountDto): Promise<any> {
    return this.service.signUp(accountDto);
  }

  get base(): CrudController<Account> {
    return this;
  }

  @Roles([])
  @Override()
  async getMany(
    @ParsedRequest() req: CrudRequest,
    @Headers('authorization') authorization,
  ) {
    const payload: any = JWT.decode(authorization);
    const user = await this.accountRepo.findOne(parseInt(payload.i));
    const { SUPER_ADMIN, ADMIN } = roles;

    if (roles.SUPER_ADMIN === payload.r) {
      return this.base.getManyBase(req);
    }

    if (roles.ADMIN === payload.r) {
      const rolesId = await this.rolesRepo
        .createQueryBuilder('roles')
        .where('roles.key = :a or roles.key = :spa', {
          a: ADMIN,
          spa: SUPER_ADMIN,
        })
        .getMany();

      req.parsed.search = {
        $or: [
          {
            roleId: { $notin: rolesId.map(r => r.id) },
          },
          {
            id: payload.i,
          },
        ],
      };

      return this.base.getManyBase(req);
    }
    return this.base.getManyBase(req);
  }


  @Post('/change-password')
  changePassword(
    @Body() passwdDto: ChangPassword,
    @Headers('authorization') authorization,
  ) {
    return this.service.changePassword(authorization, passwdDto);
  }

  @SetMetadata('GUARD_IGNORED', true)
  @Post('/login')
  signIn(
    @Body(ValidationPipe) signInDto: SignInDto,
    @Req() req,
    @Res() res
  ): Promise<{ accessToken }> {
    return this.service.signIn(signInDto, req, res);
  }

  @SetMetadata('GUARD_IGNORED', true)
  @Post('/reauth')
  logIn(
    @Body(ValidationPipe) signInDto: SignInDto,
    @Req() req,
  ) {
    return this.service.logIn(signInDto, req);
  }

  @Roles([])
  @Post('/request-new-email')
  async requestNewEmail(@Body() body, @Res() res, @Headers('authorization') authorization) {
    const { newEmail } = body;
    const payload: any = JWT.decode(authorization);
    if (this.validateEmail(newEmail)) {
      const results = await this.service.requestNewEmail(newEmail);
      return res.json(results)
    }
    else {
      throw new BadRequestException("Email invalid")
    }
  }
  validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  @Roles([])
  @Post('/request-verify-new-email')
  async requestVerifyNewEmail(@Body() body, @Res() res, @Headers('authorization') authorization) {
    const { key, value } = body;
    const payload: any = JWT.decode(authorization);
    const results = await this.service.requestVerifyNewEmail(key, value, payload.i)
    return res.json(results);
  }

  @Roles([])
  @Post('/logout-all-device')
  async logOutAllDevice(
    @Body() body,
    @Headers('authorization') authorization,
  ): Promise<{ accessToken }> {
    const { keepSession } = body;
    const payload: any = JWT.decode(authorization);
    const newSerectKeyJwt = randToken.generate(10);
    this.service
      .setNewSerectKeyJwt(payload.i, newSerectKeyJwt)
      .then(results => { })
      .catch(err => {
        return { newToken: null, ttl: -1 };
      });
    const resData = keepSession
      ? { accessToken: JWT.generate(payload.r, payload.i, newSerectKeyJwt, payload.exp), ttl: payload.exp }
      : { accessToken: null, ttl: payload.exp };
    return Promise.resolve(resData);
  }
}
