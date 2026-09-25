import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './lead.schema';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<LeadDocument>,
  ) {}

  async create(data: Partial<Lead>) {
    const lead = new this.leadModel(data);
    return lead.save();
  }

  async findAll() {
    return this.leadModel.find().sort({ createdAt: -1 }).exec();
  }

  async updateStatus(id: string, status: string) {
    const lead = await this.leadModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).exec();
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async remove(id: string) {
    const lead = await this.leadModel.findByIdAndDelete(id).exec();
    if (!lead) throw new NotFoundException('Lead not found');
    return { deleted: true };
  }
}