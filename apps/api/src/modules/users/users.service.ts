import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import type { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findById(id);
    await this.userRepo.update(id, dto);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepo.remove(user);
  }

  sanitize(user: User): Partial<User> {
    const {
      passwordHash: _p,
      refreshTokenHash: _r,
      githubAccessToken: _g,
      emailVerificationToken: _evt,
      emailVerificationTokenExpiresAt: _evte,
      passwordResetToken: _prt,
      passwordResetTokenExpiresAt: _prte,
      ...rest
    } = user;
    return rest;
  }
}
