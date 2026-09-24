import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { Prospect, ProspectDocument } from '../prospects/schemas/prospect.schema';
import { Meeting, MeetingDocument } from '../meetings/schemas/meeting.schema';
import { Builder, BuilderDocument } from '../builders/schemas/builder.schema';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Prospect.name) private prospectModel: Model<ProspectDocument>,
    @InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>,
    @InjectModel(Builder.name) private builderModel: Model<BuilderDocument>,
  ) {}

  async seedData(force = false) {
    const candidates = [
      path.resolve(process.cwd(), '../data/seed_data.json'),
      path.resolve(process.cwd(), 'data/seed_data.json'),
      path.resolve(__dirname, '../../../data/seed_data.json'),
      '/Users/mac/Desktop/realtorApp/data/seed_data.json',
    ];
    const filePath = candidates.find((p) => fs.existsSync(p));
    if (!filePath) {
      throw new Error(`Seed data file not found in candidates: ${candidates.join(', ')}`);
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    const prospectCount = await this.prospectModel.countDocuments().exec();
    const meetingCount = await this.meetingModel.countDocuments().exec();
    const builderCount = await this.builderModel.countDocuments().exec();

    if (!force && (prospectCount > 0 || meetingCount > 0 || builderCount > 0)) {
      return {
        message: 'Database already has data. Use force=true to wipe and re-seed.',
        counts: {
          prospects: prospectCount,
          meetings: meetingCount,
          builders: builderCount,
        },
      };
    }

    if (force) {
      await Promise.all([
        this.prospectModel.deleteMany({}),
        this.meetingModel.deleteMany({}),
        this.builderModel.deleteMany({}),
      ]);
    }

    // 1. Insert Builders
    let seededBuilders = 0;
    if (data.builders && data.builders.length > 0) {
      for (const b of data.builders) {
        await this.builderModel.updateOne(
          { name: b.name },
          { $set: { projects: b.projects } },
          { upsert: true },
        );
      }
      seededBuilders = data.builders.length;
    }

    // 2. Insert Prospects
    let seededProspects = 0;
    if (data.prospects && data.prospects.length > 0) {
      await this.prospectModel.insertMany(data.prospects);
      seededProspects = data.prospects.length;
    }

    // 3. Insert Meetings
    let seededMeetings = 0;
    if (data.meetings && data.meetings.length > 0) {
      await this.meetingModel.insertMany(data.meetings);
      seededMeetings = data.meetings.length;
    }

    this.logger.log(
      `Seeded: ${seededProspects} prospects, ${seededMeetings} meetings, ${seededBuilders} builders.`,
    );

    return {
      success: true,
      message: 'Successfully imported Excel (renu.xlsx) data into MongoDB!',
      imported: {
        prospects: seededProspects,
        meetings: seededMeetings,
        builders: seededBuilders,
      },
    };
  }
}
