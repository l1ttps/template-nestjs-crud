import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, async } from 'rxjs';
import Jwt from '../jwt-passport';
import { Reflector } from '@nestjs/core';
import { AccountService } from '../../account/account.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private accountService: AccountService,
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ignored = this.reflector.get('GUARD_IGNORED', context.getHandler());
    const endPointRoles: any[] = this.reflector.get<string[]>(
      'ROLES',
      context.getHandler(),
    );

    if (!endPointRoles) return true;
    if (ignored) return true;

    const headers = context.switchToHttp().getRequest().headers;
    const accessToken = headers.authorization || null;
    if (accessToken) {
      let decoded;
      try {
        const payload: any = Jwt.decode(accessToken);
        const userData: any = await this.accountService.findOne({ id: payload.i });
        decoded = Jwt.verify(accessToken, userData.secretKeyJwt);
      } catch (err) {
        throw new UnauthorizedException('Invalid Token');
      }
      if (endPointRoles.some(role => role == decoded.r)) {
        return true;
      } else if (endPointRoles.length === 0) {
        return true;
      } else {
        throw new ForbiddenException();
      }
    } else {
      throw new UnauthorizedException('Yêu cầu mã Token');
    }
  }
}
