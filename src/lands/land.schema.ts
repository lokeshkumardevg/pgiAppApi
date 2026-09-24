import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LandDocument = Land & Document;

@Schema({ timestamps: true })
export class Land {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  location: string;

  @Prop({ required: true })
  price: string;

  @Prop({ required: true })
  size: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  dimensions: string;

  @Prop({ required: true })
  facing: string;

  @Prop({ required: true })
  owner: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: Number, default: 5.0 })
  rating: number;

  @Prop({ type: [String], default: [] })
  amenities: string[];

  @Prop({ default: 'Verified' })
  verification: string;

  @Prop({ default: '' })
  measurement: string;
}

export const LandSchema = SchemaFactory.createForClass(Land);
