import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProspectDocument = Prospect & Document;

@Schema({ _id: false })
export class RemarkItem {
  @Prop({ required: true })
  note: string;

  @Prop({ default: () => new Date().toISOString() })
  date: string;

  @Prop({ default: 'Agent' })
  updatedBy: string;
}

export const RemarkItemSchema = SchemaFactory.createForClass(RemarkItem);

@Schema({ timestamps: true })
export class Prospect {
  @Prop({ required: true, default: 'Warm', index: true })
  type: string; // Hot, Warm, Cold, Not Interested

  @Prop({ default: '' })
  date: string;

  @Prop({ default: 'Vibha' })
  associateName: string;

  @Prop({ required: true, index: true })
  clientName: string;

  @Prop({ required: true, index: true })
  contact: string;

  @Prop({ default: '' })
  budget: string;

  @Prop({ default: '', index: true })
  project: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '' })
  occupation: string;

  @Prop({ default: '', index: true })
  dueDate: string;

  @Prop({ default: '' })
  timing: string;

  @Prop({ default: '' })
  purpose: string;

  @Prop({ type: [RemarkItemSchema], default: [] })
  remarks: RemarkItem[];

  @Prop({ default: false })
  meetingAttempted: boolean;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  dataSource: string;

  @Prop({ default: '' })
  dealValue: string;

  @Prop({ default: 'Active', enum: ['Active', 'Converted', 'Dropped', 'Pending'] })
  status: string;
}

export const ProspectSchema = SchemaFactory.createForClass(Prospect);
ProspectSchema.index({ clientName: 'text', contact: 'text', project: 'text' });
