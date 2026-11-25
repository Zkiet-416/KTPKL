import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'super-secret-key-warehouse',
    });
  }

  async validate(payload: any) {
    const userId = Number(payload?.sub ?? payload?.id);
    if (!userId) {
      throw new UnauthorizedException('Token không hợp lệ.');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa.');
    }

    const rawRole =
      user.roleId === 1
        ? 'ADMIN'
        : (user.role?.code ?? payload?.role ?? '');
    const normalizedRole = String(rawRole).trim().toUpperCase();

    return {
      id: user.id,
      username: user.username,
      role: normalizedRole,
      roleId: user.roleId,
    };
  }
}