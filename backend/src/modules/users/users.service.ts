import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private isAdminUser(user: User): boolean {
    return user.roleId === 1 || user.role?.code?.toUpperCase() === 'ADMIN';
  }

  private validateAssignableRole(roleId?: number) {
    if (roleId === undefined) return;
    // Hệ thống chỉ có 1 Admin duy nhất và chỉ cấp quyền cho 2 vai trò Quản lý / Nhân viên
    if (roleId === 1) {
      throw new ForbiddenException(
        'Hệ thống chỉ có duy nhất 1 tài khoản Admin, không thể cấp vai trò Admin.',
      );
    }
    if (![2, 3].includes(roleId)) {
      throw new BadRequestException(
        'Chỉ được cấp quyền cho vai trò Quản lý kho hoặc Nhân viên kho.',
      );
    }
  }

  async findAll() {
    const users = await this.userRepository.find({
      relations: ['role'],
      select: [
        'id',
        'username',
        'fullName',
        'email',
        'phone',
        'isActive',
        'roleId',
      ],
      order: { id: 'ASC' },
    });

    // Ẩn tài khoản Admin duy nhất khỏi danh sách quản lý
    return users.filter((user) => !this.isAdminUser(user));
  }

  async create(dto: CreateUserDto) {
    this.validateAssignableRole(dto.roleId);

    const existing = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException(`Username "${dto.username}" đã tồn tại.`);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepository.create({
      ...dto,
      passwordHash,
      isActive: true,
    });

    const saved = await this.userRepository.save(user);
    const { passwordHash: _, ...result } = saved;
    return result;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng ID: ${id}`);
    }

    if (this.isAdminUser(user)) {
      throw new ForbiddenException('Không thể chỉnh sửa hoặc khóa tài khoản Admin.');
    }

    if (dto.roleId !== undefined) {
      this.validateAssignableRole(dto.roleId);
    }

    if (dto.username && dto.username !== user.username) {
      const existing = await this.userRepository.findOne({
        where: { username: dto.username },
      });
      if (existing) {
        throw new ConflictException(`Username "${dto.username}" đã tồn tại.`);
      }
      user.username = dto.username;
    }

    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(dto.password, salt);
    }

    const prevActive = user.isActive;
    const nextActive =
      typeof dto.isActive === 'boolean' ? dto.isActive : user.isActive;

    Object.assign(user, {
      fullName: dto.fullName ?? user.fullName,
      email: dto.email ?? user.email,
      phone: dto.phone ?? user.phone,
      roleId: dto.roleId ?? user.roleId,
      isActive: nextActive,
    });

    const saved = await this.userRepository.save(user);
    const { passwordHash: _, ...result } = saved;

    if (prevActive && !nextActive) {
      return {
        ...result,
        message: 'Tài khoản đã bị vô hiệu hóa.',
      };
    }

    return result;
  }

  async updateRole(id: number, roleId: number) {
    this.validateAssignableRole(roleId);

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng ID: ${id}`);
    }

    if (this.isAdminUser(user)) {
      throw new ForbiddenException('Không thể thay đổi quyền của tài khoản Admin.');
    }

    user.roleId = roleId;
    const saved = await this.userRepository.save(user);
    const { passwordHash: _, ...result } = saved;
    return result;
  }

  async toggleLock(id: number, isActive: boolean) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng ID: ${id}`);
    }

    if (this.isAdminUser(user)) {
      throw new ForbiddenException('Không thể khóa tài khoản Admin.');
    }

    user.isActive = isActive;
    const saved = await this.userRepository.save(user);
    const { passwordHash: _, ...result } = saved;

    if (!isActive) {
      return {
        ...result,
        message: 'Tài khoản đã bị vô hiệu hóa.',
      };
    }

    return result;
  }
}