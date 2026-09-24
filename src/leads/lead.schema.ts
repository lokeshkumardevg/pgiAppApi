import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeadDocument = Lead & Document;

@Schema({ timestamps: true })
export class Lead {
  @Prop({ required: true })
  firstName: string;

  @Prop({ default: '' })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ default: '' })
  queryType: string;

  @Prop({ required: true })
  message: string;

  // 'new' | 'contacted' | 'closed' — plain string kept simple on purpose,
  // matches how the rest of this codebase does status-style fields.
  @Prop({ default: 'new' })
  status: string;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);