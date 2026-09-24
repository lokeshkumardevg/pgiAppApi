import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;
export type UserMemberDocument = UserMember & Document;

export const ALL_PERMISSIONS = [
  { key: 'leads:view_all', label: 'View All Leads', group: 'Leads' },
  { key: 'leads:assign', label: 'Assign & Transfer Leads', group: 'Leads' },
  { key: 'leads:create', label: 'Create New Leads', group: 'Leads' },
  { key: 'leads:edit', label: 'Edit Lead Details', group: 'Leads' },
  { key: 'leads:delete', label: 'Delete Leads', group: 'Leads' },
  { key: 'deals:convert', label: 'Close Deals (Won/Lost)', group: 'Deals' },
  { key: 'meetings:manage', label: 'Schedule & Log Site Visits', group: 'Meetings' },
  { key: 'catalog:manage', label: 'Manage Property Catalog', group: 'Catalog' },
  { key: 'team:manage', label: 'Add & Manage Sales Team', group: 'Administration' },
  { key: 'roles:manage', label: 'Manage Roles & RBAC', group: 'Administration' },
  { key: 'reports:view', label: 'View Sales Analytics & Reports', group: 'Reports' },
];

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ default: false })
  isSystem: boolean; // Super Admin cannot be deleted
}

export const RoleSchema = SchemaFactory.createForClass(Role);

@Schema({ timestamps: true })
export class UserMember {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  password: string;

  @Prop({ required: true, default: 'Sales Executive' })
  role: string;

  @Prop({ type: [String], default: [] })
  customPermissions: string[];

  @Prop({ default: 'Active', enum: ['Active', 'Inactive'] })
  status: string;
}

export const UserMemberSchema = SchemaFactory.createForClass(UserMember);
