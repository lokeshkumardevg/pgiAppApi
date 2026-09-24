import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Builder, BuilderDocument } from './schemas/builder.schema';

@Injectable()
export class BuildersService {
  constructor(
    @InjectModel(Builder.name) private builderModel: Model<BuilderDocument>,
  ) {}

  async findAll(search?: string): Promise<Builder[]> {
    if (search) {
      const regex = new RegExp(search, 'i');
      return this.builderModel
        .find({
          $or: [{ name: regex }, { projects: regex }],
        })
        .sort({ name: 1 })
        .exec();
    }
    return this.builderModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Builder> {
    const builder = await this.builderModel.findById(id).exec();
    if (!builder) {
      throw new NotFoundException(`Builder with ID ${id} not found`);
    }
    return builder;
  }

  async create(name: string, projects?: string[]): Promise<Builder> {
    const list = Array.isArray(projects)
      ? projects.map((p) => p.trim()).filter(Boolean)
      : [];
    const created = new this.builderModel({ name: name.trim(), projects: list });
    return created.save();
  }

  async addProject(id: string, projectName: string): Promise<Builder> {
    const builder = await this.builderModel.findById(id).exec();
    if (!builder) {
      throw new NotFoundException(`Builder with ID ${id} not found`);
    }
    const cleanProject = (projectName || '').trim();
    if (cleanProject && !builder.projects.includes(cleanProject)) {
      builder.projects.push(cleanProject);
      await builder.save();
    }
    return builder;
  }
}
