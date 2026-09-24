import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from './user.schema';

export interface JwtPayload {
  sub: string; // user id
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (user && user.password === password) {
      return { _id: user._id.toString(), email: user.email };
    }
    return null;
  }

  async login(user: { _id: string; email: string }) {
    const payload: JwtPayload = { sub: user._id, email: user.email };
    return { access_token: this.jwtService.sign(payload) };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password').exec();
    if (!user) throw new NotFoundException('User not found');
    return { _id: user._id, email: user.email, name: user.name };
  }

  async updateProfile(
    userId: string,
    dto: { name?: string; email?: string; currentPassword?: string; newPassword?: string },
  ) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    if (dto.name !== undefined) user.name = dto.name;

    if (dto.email !== undefined && dto.email !== user.email) {
      const existing = await this.userModel.findOne({ email: dto.email }).exec();
      if (existing && existing._id.toString() !== userId) {
        throw new BadRequestException('That email is already in use.');
      }
      user.email = dto.email;
    }

    if (dto.newPassword) {
      if (!dto.currentPassword || dto.currentPassword !== user.password) {
        throw new BadRequestException('Current password is incorrect.');
      }
      if (dto.newPassword.length < 6) {
        throw new BadRequestException('New password must be at least 6 characters.');
      }
      user.password = dto.newPassword;
    }

    await user.save();
    return { _id: user._id, email: user.email, name: user.name };
  }
}