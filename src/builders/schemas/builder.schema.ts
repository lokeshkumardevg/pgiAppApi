import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BuilderDocument = Builder & Document;

@Schema({ timestamps: true })
export class Builder {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop({ type: [String], default: [] })
  projects: string[];
}

export const BuilderSchema = SchemaFactory.createForClass(Builder);
