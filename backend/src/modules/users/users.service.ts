import {
  ConflictException,
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

  async findAll() {
    const users = await this.userRepository.find({
      relations: ['role'],
      select: ['id', 'username', 'fullName', 'email', 'phone', 'isActive', 'createdAt', 'roleId'],
      order: { id: 'ASC' },
    });
    return users;
  }

  async create(dto: CreateUserDto) {
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
    });

    const saved = await this.userRepository.save(user);
    const { passwordHash: _, ...result } = saved;
    return result;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng ID: ${id}`);
    }

    if (dto.username && dto.username !== user.username) {
      const existing = await this.userRepository.findOne({ where: { username: dto.username } });
      if (existing) {
        throw new ConflictException(`Username "${dto.username}" đã tồn tại.`);
      }
      user.username = dto.username;
    }

    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(dto.password, salt);
    }

    Object.assign(user, {
      fullName: dto.fullName ?? user.fullName,
      email: dto.email ?? user.email,
      phone: dto.phone ?? user.phone,
      roleId: dto.roleId ?? user.roleId,
      isActive: typeof dto.isActive === 'boolean' ? dto.isActive : user.isActive,
    });

    const saved = await this.userRepository.save(user);
    const { passwordHash: _, ...result } = saved;
    return result;
  }

  async updateRole(id: number, roleId: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng ID: ${id}`);
    }
    user.roleId = roleId;
    const saved = await this.userRepository.save(user);
    const { passwordHash: _, ...result } = saved;
    return result;
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng ID: ${id}`);
    }
    user.isActive = false;
    await this.userRepository.save(user);
    return { message: 'Đã vô hiệu hóa người dùng thành công.' };
  }
}