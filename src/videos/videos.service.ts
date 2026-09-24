import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video, VideoDocument } from './video.schema';

@Injectable()
export class VideosService {
  constructor(@InjectModel(Video.name) private videoModel: Model<VideoDocument>) {}

  async findAll(): Promise<Video[]> {
    return this.videoModel.find().exec();
  }

  async findOne(id: string): Promise<Video> {
    const video = await this.videoModel.findById(id).exec();
    if (!video) {
      throw new NotFoundException(`Video with ID "${id}" not found`);
    }
    return video;
  }

  async create(dto: Partial<Video>): Promise<Video> {
    const created = new this.videoModel(dto);
    return created.save();
  }

  async update(id: string, dto: Partial<Video>): Promise<Video> {
    const updated = await this.videoModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Video with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.videoModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Video with ID "${id}" not found`);
    }
  }
}
