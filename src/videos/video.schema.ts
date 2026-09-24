import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VideoDocument = Video & Document;

@Schema({ timestamps: true })
export class Video {
  @Prop({ required: true })
  src: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  subtitle: string;

  @Prop({ default: '' })
  badge: string;

  @Prop({ default: 'small' })
  size: string;

  @Prop({ required: true })
  tag: string;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
