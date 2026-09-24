import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Page, PageDocument } from './page.schema';

@Injectable()
export class PagesService {
  constructor(@InjectModel(Page.name) private pageModel: Model<PageDocument>) {}

  async findAll(): Promise<Page[]> {
    return this.pageModel.find().sort({ createdAt: -1 }).exec();
  }

  async findBySlug(slug: string): Promise<Page> {
    const page = await this.pageModel.findOne({ slug }).exec();
    if (!page) {
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }
    return page;
  }

  async create(dto: Partial<Page>): Promise<Page> {
    const created = new this.pageModel(dto);
    return created.save();
  }
}
