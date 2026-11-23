import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.log('JWT GUARD DEBUG:', { err, user, info });
      throw err || new UnauthorizedException();
    }
    return user;
  }
}