import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { RbacService } from './rbac.service';

@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('permissions')
  getPermissions() {
    return this.rbacService.getPermissions();
  }

  // Roles Endpoints
  @Get('roles')
  async getRoles() {
    return this.rbacService.getRoles();
  }

  @Post('roles')
  async createRole(
    @Body('name') name: string,
    @Body('description') description?: string,
    @Body('permissions') permissions?: string[],
  ) {
    return this.rbacService.createRole({ name, description, permissions });
  }

  @Patch('roles/:id')
  async updateRole(
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string; permissions?: string[] },
  ) {
    return this.rbacService.updateRole(id, data);
  }

  @Delete('roles/:id')
  async deleteRole(@Param('id') id: string) {
    return this.rbacService.deleteRole(id);
  }

  // Auth Endpoints
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password?: string,
  ) {
    return this.rbacService.login(email, password);
  }

  // Users Endpoints
  @Get('users')
  async getUsers() {
    return this.rbacService.getUsers();
  }

  @Post('users')
  async createUser(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('phone') phone?: string,
    @Body('role') role?: string,
    @Body('password') password?: string,
    @Body('customPermissions') customPermissions?: string[],
  ) {
    return this.rbacService.createUser({ name, email, phone, role: role || 'Sales Executive', password, customPermissions });
  }

  @Post('users/:id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.rbacService.changePassword(id, newPassword);
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: { name?: string; email?: string; phone?: string; role?: string; status?: string; customPermissions?: string[] },
  ) {
    return this.rbacService.updateUser(id, data);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.rbacService.deleteUser(id);
  }
}
