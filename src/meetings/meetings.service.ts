import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meeting, MeetingDocument } from './schemas/meeting.schema';
import { CreateMeetingDto } from './dto/create-meeting.dto';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>,
  ) {}

  async findAll(query: { search?: string; status?: string; date?: string; type?: string }): Promise<Meeting[]> {
    const filter: any = {};

    if (query.status) {
      filter.status = query.status;
    }
    if (query.type) {
      filter.type = query.type;
    }
    if (query.date) {
      filter.date = new RegExp(query.date, 'i');
    }
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [
        { clientName: regex },
        { contact: regex },
        { project: regex },
        { meetingPlace: regex },
      ];
    }

    return this.meetingModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Meeting> {
    const meeting = await this.meetingModel.findById(id).exec();
    if (!meeting) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    return meeting;
  }

  async create(createDto: CreateMeetingDto): Promise<Meeting> {
    const created = new this.meetingModel(createDto);
    return created.save();
  }

  async update(id: string, updateData: Partial<Meeting>): Promise<Meeting> {
    const meeting = await this.meetingModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!meeting) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    return meeting;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const res = await this.meetingModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    return { success: true };
  }
}
