import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MeetingDocument = Meeting & Document;

@Schema({ timestamps: true })
export class Meeting {
  @Prop({ type: Types.ObjectId, ref: 'Prospect', required: false })
  prospectId: Types.ObjectId;

  @Prop({ default: 'Warm' })
  type: string;

  @Prop({ default: '' })
  date: string;

  @Prop({ default: 'Vibha' })
  associateName: string;

  @Prop({ required: true })
  clientName: string;

  @Prop({ required: true })
  contact: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  occupation: string;

  @Prop({ default: '' })
  project: string;

  @Prop({ default: '' })
  meetingPlace: string;

  @Prop({ default: false })
  meetingAttempted: boolean;

  @Prop({ default: '' })
  budget: string;

  @Prop({ default: '' })
  doneBy: string;

  @Prop({ default: false })
  visit: boolean;

  @Prop({ default: '' })
  remarks: string;

  @Prop({ default: '' })
  obStatus: string;

  @Prop({ default: '' })
  expectedClosureDate: string;

  @Prop({ default: 'Scheduled', enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'] })
  status: string;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
MeetingSchema.index({ clientName: 'text', contact: 'text' });
