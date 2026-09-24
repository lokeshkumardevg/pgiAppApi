import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Land, LandDocument } from './land.schema';

@Injectable()
export class LandsService {
  constructor(@InjectModel(Land.name) private landModel: Model<LandDocument>) {}

  async findAll(): Promise<Land[]> {
    return this.landModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Land> {
    const land = await this.landModel.findById(id).exec();
    if (!land) {
      throw new NotFoundException(`Land plot with ID "${id}" not found`);
    }
    return land;
  }

  async create(dto: Partial<Land>): Promise<Land> {
    const created = new this.landModel(dto);
    return created.save();
  }

  async update(id: string, dto: Partial<Land>): Promise<Land> {
    const updated = await this.landModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Land plot with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.landModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Land plot with ID "${id}" not found`);
    }
  }
}
