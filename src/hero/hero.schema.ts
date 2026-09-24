import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HeroSettingsDocument = HeroSettings & Document;

// There is only ever ONE HeroSettings document in the collection — it's a
// singleton that stores the ordered list of images shown in the home page
// hero section (previously hardcoded as `heroVideos` in pages/index.tsx).
@Schema({ timestamps: true })
export class HeroSettings {
  @Prop({ type: [String], default: [] })
  images: string[];
}

export const HeroSettingsSchema = SchemaFactory.createForClass(HeroSettings);