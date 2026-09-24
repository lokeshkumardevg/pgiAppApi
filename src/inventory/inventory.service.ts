import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory, InventoryDocument } from './schemas/inventory.schema';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/create-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<InventoryDocument>,
  ) {}

  async findAll(query: {
    search?: string;
    unitType?: string;
    status?: string;
    project?: string;
    brokerName?: string;
  }): Promise<{ data: Inventory[]; total: number }> {
    const filter: any = {};

    if (query.unitType && query.unitType !== 'All') {
      filter.unitType = new RegExp(`^${query.unitType}$`, 'i');
    }

    if (query.status && query.status !== 'All') {
      filter.status = new RegExp(`^${query.status}$`, 'i');
    }

    if (query.project && query.project !== 'All') {
      filter.project = new RegExp(query.project, 'i');
    }

    if (query.brokerName) {
      filter.brokerName = new RegExp(query.brokerName, 'i');
    }

    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [
        { project: regex },
        { unitNo: regex },
        { address: regex },
        { brokerName: regex },
        { contactNo: regex },
        { size: regex },
      ];
    }

    const data = await this.inventoryModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();

    const total = await this.inventoryModel.countDocuments(filter).exec();

    return { data, total };
  }

  async findOne(id: string): Promise<Inventory> {
    const item = await this.inventoryModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }
    return item;
  }

  async create(createDto: CreateInventoryDto): Promise<Inventory> {
    const created = new this.inventoryModel({
      ...createDto,
      date: createDto.date || new Date().toISOString().split('T')[0],
      status: createDto.status || 'Available',
    });
    return created.save();
  }

  async update(id: string, updateDto: UpdateInventoryDto): Promise<Inventory> {
    const updated = await this.inventoryModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<{ success: boolean; id: string }> {
    const res = await this.inventoryModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }
    return { success: true, id };
  }

  async seedDefaultData(): Promise<number> {
    const count = await this.inventoryModel.countDocuments().exec();
    if (count > 0) return count;

    const sampleData = [
      {
        size: '1850 Sq.Ft',
        project: 'DLF The Camellias',
        address: 'Golf Course Road, Sector 42, Gurgaon',
        unitType: '4 BHK',
        unitNo: 'Tower B - 1202',
        contactNo: '9811234567',
        brokerName: 'Rajesh Verma',
        date: '2026-09-15',
        price: '₹4.50 Cr',
        status: 'Available',
        notes: 'Park facing luxury unit, 2 car parking slots included.',
      },
      {
        size: '1450 Sq.Ft',
        project: 'Ace Aspire',
        address: 'Techzone 4, Greater Noida West',
        unitType: '3 BHK',
        unitNo: 'Tower 4 - 804',
        contactNo: '9876543210',
        brokerName: 'Sanjay Malik',
        date: '2026-09-16',
        price: '₹1.15 Cr',
        status: 'Available',
        notes: 'Semi-furnished, modular kitchen installed.',
      },
      {
        size: '1050 Sq.Ft',
        project: 'Godrej Woods',
        address: 'Sector 43, Noida',
        unitType: '2 BHK',
        unitNo: 'Tower Willow - 501',
        contactNo: '9910098765',
        brokerName: 'Vikram Associates',
        date: '2026-09-17',
        price: '₹1.40 Cr',
        status: 'Under Discussion',
        notes: 'Client meeting arranged for Saturday.',
      },
      {
        size: '1000 Sq.Yd',
        project: 'Green Meadows Farmhouses',
        address: 'Chhatarpur Farms, South Delhi',
        unitType: 'Farm House',
        unitNo: 'Farm Villa #8',
        contactNo: '9810112233',
        brokerName: 'Kapoor Estates',
        date: '2026-09-12',
        price: '₹8.75 Cr',
        status: 'Available',
        notes: 'Clear title, swimming pool, manicured lawn.',
      },
      {
        size: '250 Sq.Yd',
        project: 'BPTP Park Elite Floors',
        address: 'Sector 75, Faridabad',
        unitType: 'Plot',
        unitNo: 'Plot #D-45',
        contactNo: '9899123456',
        brokerName: 'Sharma & Sons Realtors',
        date: '2026-09-14',
        price: '₹1.80 Cr',
        status: 'Available',
        notes: 'Corner plot, 18m wide road facing.',
      },
    ];

    await this.inventoryModel.insertMany(sampleData);
    return sampleData.length;
  }
}
