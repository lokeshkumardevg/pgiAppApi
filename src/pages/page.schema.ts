import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PageDocument = Page & Document;

@Schema({ timestamps: true })
export class Page {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  htmlContent: string;
}

export const PageSchema = SchemaFactory.createForClass(Page);
