import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUsers = await this.userRepository.find({
      where: { username: dto.username },
    });
    const isDuplicate = existingUsers.some(
      (u) => u.username.toLowerCase() === dto.username.toLowerCase(),
    );
    if (isDuplicate) {
      throw new ConflictException(`Username "${dto.username}" đã tồn tại.`);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Chỉ cho phép đăng ký vai trò mặc định không phải ADMIN (tránh tạo thêm ADMIN)
    const safeRoleId = dto.roleId && dto.roleId !== 1 ? dto.roleId : 3;

    const user = this.userRepository.create({
      username: dto.username,
      passwordHash,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      roleId: safeRoleId,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);
    const { passwordHash: _, ...result } = savedUser;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { username: dto.username },
      relations: ['role'],
    });

    if (!user || user.username !== dto.username) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu.');
    }

    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(user.passwordHash);
    const isMatch = isBcryptHash
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : dto.password === user.passwordHash;

    if (!isMatch) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa.');
    }

    const normalizedRole =
      user.roleId === 1
        ? 'ADMIN'
        : String(user.role?.code ?? '').toUpperCase();

    const payload = {
      sub: user.id,
      username: user.username,
      role: normalizedRole,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: normalizedRole,
      },
    };
  }
}