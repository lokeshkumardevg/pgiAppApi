import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HeroSettings, HeroSettingsDocument } from './hero.schema';

// Sensible defaults so the hero section still shows something the very
// first time the app runs, before an admin has saved anything from the
// dashboard.
const DEFAULT_HERO_IMAGES = [
  '/hero3.jpg',
  '/hero5.png',
  '/hero_8.jpeg',
  '/hero_9.jpeg',
  '/hero_10.jpeg',
];

// Fixed, well-known id for the single settings document. Using
// findOneAndUpdate with upsert against this exact id (instead of a plain
// findOne()/create() pair) guarantees there is ever only ONE HeroSettings
// document, even under concurrent requests — so a GET (home page) and a
// PUT (dashboard save) can never end up reading/writing two different
// documents.
const SINGLETON_ID = '000000000000000000000001';

@Injectable()
export class HeroService {
  constructor(
    @InjectModel(HeroSettings.name)
    private readonly heroModel: Model<HeroSettingsDocument>,
  ) {}

  async getImages(): Promise<string[]> {
    const doc = await this.heroModel
      .findOneAndUpdate(
        { _id: SINGLETON_ID },
        { $setOnInsert: { images: DEFAULT_HERO_IMAGES } },
        { new: true, upsert: true },
      )
      .exec();
    return doc.images;
  }

  async setImages(images: string[]): Promise<string[]> {
    const doc = await this.heroModel
      .findOneAndUpdate(
        { _id: SINGLETON_ID },
        { $set: { images } },
        { new: true, upsert: true },
      )
      .exec();
    return doc.images;
  }
}