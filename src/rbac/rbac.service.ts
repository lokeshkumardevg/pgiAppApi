import { Injectable, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument, UserMember, UserMemberDocument, ALL_PERMISSIONS } from './schemas/rbac.schema';

export function generatePasswordFromNameAndPhone(name: string, phone?: string): string {
  const cleanName = (name || '').trim();
  const firstName = cleanName.split(/\s+/)[0] || 'User';
  const capitalized = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  const digits = (phone || '').replace(/\D/g, '');
  const suffix = digits.length >= 4 ? digits.slice(-4) : '1234';
  return `${capitalized}@${suffix}`;
}

@Injectable()
export class RbacService implements OnModuleInit {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(UserMember.name) private userModel: Model<UserMemberDocument>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultRolesAndUsers();
  }

  async seedDefaultRolesAndUsers() {
    const roleCount = await this.roleModel.countDocuments().exec();
    if (roleCount === 0) {
      const allPermKeys = ALL_PERMISSIONS.map((p) => p.key);

      const defaultRoles = [
        {
          name: 'Super Admin',
          description: 'Full root access to entire system, team, roles and sales data',
          permissions: allPermKeys,
          isSystem: true,
        },
        {
          name: 'Admin',
          description: 'Administrative control over sales pipeline, deals, and reports',
          permissions: allPermKeys.filter((k) => k !== 'roles:manage'),
          isSystem: true,
        },
        {
          name: 'Sales Manager',
          description: 'Oversees sales team, assigns leads, and tracks revenue pipeline',
          permissions: [
            'leads:view_all',
            'leads:assign',
            'leads:create',
            'leads:edit',
            'deals:convert',
            'meetings:manage',
            'catalog:manage',
            'reports:view',
          ],
          isSystem: false,
        },
        {
          name: 'Sales Executive',
          description: 'Works with assigned clients, conducts site visits, and logs deals',
          permissions: [
            'leads:create',
            'leads:edit',
            'deals:convert',
            'meetings:manage',
          ],
          isSystem: false,
        },
      ];

      for (const r of defaultRoles) {
        await this.roleModel.create(r);
      }
    }

    const userCount = await this.userModel.countDocuments().exec();
    if (userCount === 0) {
      const defaultUsers = [
        {
          name: 'Super Administrator',
          email: 'admin@realtorcrm.com',
          phone: '+91 9999900001',
          password: 'Admin@0001',
          role: 'Super Admin',
          status: 'Active',
        },
        {
          name: 'Vibha',
          email: 'vibha@realtorcrm.com',
          phone: '+91 9811102393',
          password: 'Vibha@2393',
          role: 'Sales Executive',
          status: 'Active',
        },
        {
          name: 'Rahul Sharma',
          email: 'rahul.sharma@realtorcrm.com',
          phone: '+91 9876543210',
          password: 'Rahul@3210',
          role: 'Sales Executive',
          status: 'Active',
        },
        {
          name: 'Priya Singh',
          email: 'priya.singh@realtorcrm.com',
          phone: '+91 9812345678',
          password: 'Priya@5678',
          role: 'Sales Executive',
          status: 'Active',
        },
        {
          name: 'Amit Verma',
          email: 'amit.verma@realtorcrm.com',
          phone: '+91 9711223344',
          password: 'Amit@3344',
          role: 'Sales Manager',
          status: 'Active',
        },
      ];

      for (const u of defaultUsers) {
        await this.userModel.create(u);
      }
    } else {
      // Ensure any existing user without a password gets an auto-generated password
      const usersWithoutPassword = await this.userModel.find({
        $or: [{ password: '' }, { password: { $exists: false } }],
      }).exec();
      for (const u of usersWithoutPassword) {
        if (u.role === 'Super Admin' && u.email === 'admin@realtorcrm.com') {
          u.password = 'Admin@0001';
        } else {
          u.password = generatePasswordFromNameAndPhone(u.name, u.phone);
        }
        await u.save();
      }
    }
  }

  // Permissions Catalog
  getPermissions() {
    return ALL_PERMISSIONS;
  }

  // Roles CRUD
  async getRoles(): Promise<Role[]> {
    return this.roleModel.find().sort({ isSystem: -1, createdAt: 1 }).exec();
  }

  async createRole(data: { name: string; description?: string; permissions?: string[] }): Promise<Role> {
    const existing = await this.roleModel.findOne({ name: new RegExp(`^${data.name.trim()}$`, 'i') }).exec();
    if (existing) {
      throw new BadRequestException(`Role with name '${data.name}' already exists.`);
    }

    const role = new this.roleModel({
      name: data.name.trim(),
      description: data.description || '',
      permissions: data.permissions || [],
      isSystem: false,
    });
    return role.save();
  }

  async updateRole(id: string, data: { name?: string; description?: string; permissions?: string[] }): Promise<Role> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException(`Role not found`);
    }

    if (role.isSystem && role.name === 'Super Admin' && data.name && data.name !== 'Super Admin') {
      throw new BadRequestException('Cannot rename Super Admin role.');
    }

    if (data.name) role.name = data.name.trim();
    if (data.description !== undefined) role.description = data.description;
    if (data.permissions !== undefined) role.permissions = data.permissions;

    return role.save();
  }

  async deleteRole(id: string): Promise<{ success: boolean }> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException(`Role not found`);
    }

    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be deleted.');
    }

    await this.roleModel.findByIdAndDelete(id).exec();
    return { success: true };
  }

  // Users CRUD
  async getUsers(): Promise<UserMember[]> {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  async createUser(data: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
    password?: string;
    customPermissions?: string[];
  }): Promise<any> {
    const cleanEmail = data.email.toLowerCase().trim();
    const existing = await this.userModel.findOne({ email: cleanEmail }).exec();
    if (existing) {
      throw new BadRequestException(`User with email '${data.email}' already exists.`);
    }

    const generatedPassword =
      data.password && data.password.trim().length > 0
        ? data.password.trim()
        : generatePasswordFromNameAndPhone(data.name, data.phone);

    const user = new this.userModel({
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone || '',
      password: generatedPassword,
      role: data.role || 'Sales Executive',
      customPermissions: data.customPermissions || [],
      status: 'Active',
    });

    const saved = await user.save();
    const res: any = saved.toObject();
    res.generatedPassword = generatedPassword;
    return res;
  }

  async login(
    email: string,
    password?: string,
  ): Promise<{ success: boolean; user?: UserMember; error?: string }> {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    const user = await this.userModel.findOne({ email: cleanEmail }).exec();
    if (!user) {
      return {
        success: false,
        error: `No registered account found with email "${email}".`,
      };
    }

    if (user.status === 'Inactive') {
      return {
        success: false,
        error: 'Your account is inactive. Please contact your Super Administrator.',
      };
    }

    // Verify password if set on user record
    if (user.password && user.password.trim()) {
      if (!password || password.trim() !== user.password.trim()) {
        return {
          success: false,
          error: 'Incorrect password. Please verify and try again.',
        };
      }
    }

    return { success: true, user };
  }

  async changePassword(
    userId: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!newPassword || newPassword.trim().length < 4) {
      throw new BadRequestException('New password must be at least 4 characters long.');
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User account not found.');
    }

    user.password = newPassword.trim();
    await user.save();

    return { success: true, message: 'Password updated successfully.' };
  }

  async updateUser(id: string, data: { name?: string; email?: string; phone?: string; role?: string; status?: string; password?: string; customPermissions?: string[] }): Promise<UserMember> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (data.name) user.name = data.name.trim();
    if (data.email) user.email = data.email.toLowerCase().trim();
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.role) user.role = data.role;
    if (data.status) user.status = data.status;
    if (data.password) user.password = data.password.trim();
    if (data.customPermissions !== undefined) user.customPermissions = data.customPermissions;

    return user.save();
  }

  async deleteUser(id: string): Promise<{ success: boolean }> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    if (user.role === 'Super Admin') {
      const superAdminCount = await this.userModel.countDocuments({ role: 'Super Admin' }).exec();
      if (superAdminCount <= 1) {
        throw new BadRequestException('Cannot delete the last Super Admin.');
      }
    }

    await this.userModel.findByIdAndDelete(id).exec();
    return { success: true };
  }
}
