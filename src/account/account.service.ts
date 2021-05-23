import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  NotAcceptableException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Account } from './account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SignInDto, AccountDto } from './acccount.dto';
import { AccountRepository } from './account.repository';
import { LogService } from 'src/log/log.service';
import { LogType } from 'src/log/log_type.enum';
import { RolesService } from '../roles/roles.service';
import JWT from '../services/jwt-passport';
import roles from 'src/services/guard/roles';
import * as randToken from 'rand-token';
import { RedisService } from 'src/services/caching/redis/redis.service';
import { SendMailService } from 'src/services/send-mail/send-mail/send-mail.service';
var randomize = require('randomatic');
@Injectable()
export class AccountService extends TypeOrmCrudService<Account> {
  constructor(
    @InjectRepository(AccountRepository)
    private userRepository: AccountRepository,
    @InjectRepository(Account) repo,
    private logService: LogService,
    private rolesService: RolesService,
    private redis: RedisService,
    private sendmailServices: SendMailService,
  ) {
    super(repo);
  }

  async archive(id): Promise<any> {
    return this.repo.update({ id }, { isArchive: true });
  }

  async antiBruteForce(type, username, ipAddress) {
    interface AntiBruteForce {
      counters: number,
      account: string,
      ipAddress: string
    }
    const key = `login_${username}_${ipAddress}`;
    const check: string = await this.redis.get(key);
    const valueRedis = JSON.parse(check)
    if (valueRedis) {
      let logRecord = {
        type: LogType.INFO,
        ip: ipAddress,
        createDate: new Date(),
      };
      valueRedis.counters === 4 && await this.logService.createLog({
        message: `${username} đã cố đăng nhập sai nhiều lần`,
        ...logRecord
      });
    }
    if (type === "create") {
      if (!check) {
        const newDataAnti: AntiBruteForce = {
          counters: 0,
          account: username,
          ipAddress: ipAddress
        }
        this.redis.set(key, JSON.stringify(newDataAnti), "EX", 120);
      }
      else {
        this.redis.set(key, JSON.stringify({ ...valueRedis, counters: valueRedis.counters + 1 }), "EX", 120);
      }
    }
    else if (type === "check") {
      if (!valueRedis) {
        return false;
      }
      else if (valueRedis.counters >= 5) {
        return valueRedis
      }
      return false;
    }
  }
  async signIn(
    authCredentialsDto: SignInDto,
    req: any,
    res: any
  ): Promise<{ accessToken: string }> {
    const user: any = await this.validateUserPassword(
      authCredentialsDto,
      req,
    );
    const ipAddress = await this.logService.getIp4Log(req);
    const checkAntiBruteForce = await this.antiBruteForce("check", authCredentialsDto.username, ipAddress);
    let logRecord = {
      type: LogType.INFO,
      ip: ipAddress,
      createDate: new Date(),
    };
    if (checkAntiBruteForce) {
      return res.status(429).json({ message: "Đăng nhập sai quá nhiều lần" })
    }


    if (!user) {
      this.antiBruteForce("create", authCredentialsDto.username, ipAddress);
      throw new UnauthorizedException('Username or password incorrect');
    } else {
      const role = await this.rolesService.findOne({ id: user.roleId });
      const roleKey = (role && role.key) || 'ANONYMOUS';
      let secretKeyJwt;
      if (user.secretKeyJwt) {
        secretKeyJwt = user.secretKeyJwt;
      } else {
        const _genRandSerectKey = randToken.generate(10);
        const newDataUser = await this.setNewSerectKeyJwt(
          user.id,
          _genRandSerectKey,
        );
        secretKeyJwt = _genRandSerectKey;
      }
      let accessToken = JWT.generate(roleKey, user.id, secretKeyJwt, authCredentialsDto.ttl);
      const resData = {
        accessToken: `Bearer ${accessToken}`,
        id: user.id
      };
      await this.logService.createLog({
        message: `${authCredentialsDto.username} login success`,
        ...logRecord
      });
      return res.json(resData);
    }
  }

  async logIn(
    authCredentialsDto: SignInDto,
    req: any,
  ) {
    const user: any = await this.validateUserPassword(
      authCredentialsDto,
      req,
    );

    if (!user) {
      throw new UnauthorizedException
    }

    return { message: "Success" };

  }

  async signUp(authCredentialsDto: AccountDto,): Promise<void> {
    const { username, password, email, phone } = authCredentialsDto;
    const user = new Account();
    Object.assign(user, { username, email, phone });
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);
    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(error.detail);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async validateUserPassword(
    authCredentialsDto: SignInDto,
    req: any,
  ): Promise<object> {
    let { username, password } = authCredentialsDto;
    username = username.toLocaleLowerCase();
    const user =
      username.indexOf('@') === -1
        ? await this.userRepository.findOne({ username })
        : await this.userRepository.findOne({ email: username });

    // let logRecord = {
    //   type: LogType.INFO,
    //   ip: await this.logService.getIp4Log(req),
    //   createDate: new Date(),
    // }
    if (user && (await user.validatePassword(password))) {
      // await this.logService.createLog({
      //   message: `${username} đăng nhập thành công!`,
      //   ...logRecord
      // });
      return user;
    }
    // await this.logService.createLog({
    //   message: `${username} đăng nhập thất bại!`,
    //   ...logRecord
    // });
    return null;
  }

  async checkPermission(authorization, id) {
    const payload: any = JWT.decode(authorization);
    const { SUPER_ADMIN } = roles;

    // current account
    const user = await this.userRepository
      .createQueryBuilder('account')
      .innerJoinAndSelect('account.role', 'roles')
      .where('account.id = :aid', { aid: payload.i })
      .getOne();

    // account wanna update, get, del
    const uparam = await this.userRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.role', 'roles')
      .where('account.id = :upid', { upid: id })
      .getOne();

    // in case not found account target
    if (!uparam) return false;

    // get role of target account
    const uprRole = JSON.parse(JSON.stringify(uparam.role));

    // permission for super admin or self-account
    if (payload.r === SUPER_ADMIN || parseInt(payload.i) === parseInt(id)) {
      return true;
    }

    return false;
  }

  async changePassword(authorization, passwdDto): Promise<any> {
    const payload: any = JWT.decode(authorization);
    const uid = parseInt(payload.i);
    const { current_password, new_password } = passwdDto;
    const account = await this.userRepository.findOne({ id: uid });

    // should true password and account not empty
    const compare =
      account && (await account.validatePassword(current_password));
    // should have permission
    const permission = await this.checkPermission(authorization, uid);

    if (compare && permission) {
      const newHashPwd = await this.hashPassword(new_password, account.salt);
      return this.userRepository.update({ id: uid }, { password: newHashPwd });
    }

    throw new NotAcceptableException();
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }

  async setNewSerectKeyJwt(uid, newSerectKeyJwt?) {
    const secretKeyJwt = newSerectKeyJwt
      ? newSerectKeyJwt
      : randToken.generate(10);
    return this.userRepository.update(
      { id: uid },
      { secretKeyJwt: secretKeyJwt },
    );
  }

  async requestNewEmail(newEmail) {
    const ttl = 120; // 2 min
    const checkRedisCache = await this.redis.get(`new-email-${newEmail}`);
    if (!checkRedisCache) {
      try {
        const results = await this.userRepository.findOne({ email: newEmail })
        if (!results) {
          const key = `new-email-${newEmail}`;
          const verifyCode = randomize("0", 6);
          const redisCacheValue = {
            verifyCode: verifyCode,
            email: newEmail,
          }
          this.redis.set(key, JSON.stringify(redisCacheValue), "EX", ttl)
          // this.sendmailServices.mailReqNewEmail(verifyCode, newEmail);
          return { message: "Verify code has been sent", key: key }
        }
        else {
          if (!results.emailVerified) {
            const key = `new-email-${newEmail}`;
            const verifyCode = randomize("0", 6);
            const redisCacheValue = {
              verifyCode: verifyCode,
              email: newEmail,
            }
            this.redis.set(key, JSON.stringify(redisCacheValue), "EX", ttl)
            // this.sendmailServices.mailReqNewEmail(verifyCode, newEmail);
            return { message: "Verify code has been sent", key: key }
          }
          else {
            throw new Error("Email is already in use");
          }
        }
      }
      catch (e) {
        throw new BadRequestException(e.message);
      }
    }
    else {
      throw new ConflictException("Too many requests");
    }
  }
  async requestVerifyNewEmail(key, value, userId) {
    const checkRedisCache = await this.redis.get(key);
    if (checkRedisCache) {
      const data = JSON.parse(checkRedisCache)
      if (value === data.verifyCode) {
        try {
          this.userRepository.update({ id: userId }, { email: data.email, emailVerified: true })
          return { message: "Email has been changed successfully" }
        }
        catch (e) {
          throw new InternalServerErrorException();
        }

      }
      else {
        throw new UnauthorizedException("Verify code is incorrect")
      }
    }
    else {
      throw new UnauthorizedException("Verify code is incorrect")
    }
  }
}
