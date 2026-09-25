import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prospect, ProspectDocument } from './schemas/prospect.schema';
import { UserMember, UserMemberDocument } from '../rbac/schemas/rbac.schema';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { UpdateProspectDto } from './dto/update-prospect.dto';

@Injectable()
export class ProspectsService {
  constructor(
    @InjectModel(Prospect.name) private prospectModel: Model<ProspectDocument>,
    @InjectModel(UserMember.name) private userMemberModel: Model<UserMemberDocument>,
  ) {}

  async findAll(query: {
    type?: string;
    search?: string;
    project?: string;
    status?: string;
    dueDate?: string;
    associateName?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Prospect[]; total: number; page: number; totalPages: number }> {
    const andClauses: any[] = [];

    if (query.type && query.type !== 'All') {
      andClauses.push({ type: query.type });
    }

    if (query.status && query.status !== 'All') {
      andClauses.push({ status: query.status });
    }

    if (query.associateName && query.associateName !== 'All') {
      if (query.associateName === 'Unassigned') {
        andClauses.push({
          $or: [
            { associateName: { $exists: false } },
            { associateName: '' },
            { associateName: '0' },
          ],
        });
      } else if (query.associateName.toLowerCase() === 'vibha') {
        andClauses.push({ associateName: new RegExp('^vibha', 'i') });
      } else {
        andClauses.push({ associateName: new RegExp(`^${query.associateName.trim()}$`, 'i') });
      }
    }

    if (query.project) {
      andClauses.push({ project: new RegExp(query.project, 'i') });
    }

    if (query.dueDate) {
      andClauses.push({ dueDate: new RegExp(query.dueDate, 'i') });
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      andClauses.push({
        $or: [
          { clientName: searchRegex },
          { contact: searchRegex },
          { project: searchRegex },
          { associateName: searchRegex },
        ],
      });
    }

    const filter = andClauses.length > 0 ? { $and: andClauses } : {};

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prospectModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).exec(),
      this.prospectModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAssociates(): Promise<Array<{ name: string; leadCount: number; hotCount: number; convertedCount: number; role?: string }>> {
    const aggregation = await this.prospectModel.aggregate([
      {
        $group: {
          _id: '$associateName',
          total: { $sum: 1 },
          hot: { $sum: { $cond: [{ $eq: ['$type', 'Hot'] }, 1, 0] } },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] } },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const results: Array<{ name: string; leadCount: number; hotCount: number; convertedCount: number; role?: string }> = [];
    const seen = new Set<string>();

    for (const item of aggregation) {
      let rawName = (item._id || '').trim();
      if (!rawName || rawName === '0') continue;
      // Normalise e.g. "vibha(kirti)" -> "Vibha"
      let cleanName = rawName;
      if (/^vibha/i.test(cleanName)) cleanName = 'Vibha';
      if (!seen.has(cleanName.toLowerCase())) {
        seen.add(cleanName.toLowerCase());
        results.push({
          name: cleanName,
          leadCount: item.total,
          hotCount: item.hot,
          convertedCount: item.converted,
        });
      } else {
        const found = results.find((r) => r.name.toLowerCase() === cleanName.toLowerCase());
        if (found) {
          found.leadCount += item.total;
          found.hotCount += item.hot;
          found.convertedCount += item.converted;
        }
      }
    }

    // Include all active users from RBAC UserMember collection
    try {
      if (this.userMemberModel) {
        const activeUsers = await this.userMemberModel.find({ status: 'Active' }).exec();
        for (const user of activeUsers) {
          if (!user.name) continue;
          const uName = user.name.trim();
          const existing = results.find((r) => r.name.toLowerCase() === uName.toLowerCase());
          if (existing) {
            existing.role = user.role;
          } else {
            seen.add(uName.toLowerCase());
            results.push({
              name: uName,
              role: user.role,
              leadCount: 0,
              hotCount: 0,
              convertedCount: 0,
            });
          }
        }
      }
    } catch (err) {
      console.warn('Failed to query RBAC users in getAssociates:', err);
    }

    return results;
  }

  async assign(id: string, associateName: string, assignedBy = 'Admin'): Promise<Prospect> {
    const prospect = await this.prospectModel.findById(id).exec();
    if (!prospect) {
      throw new NotFoundException(`Prospect with ID ${id} not found`);
    }

    const previousAssociate = prospect.associateName || 'Unassigned';
    prospect.associateName = associateName;
    prospect.remarks.unshift({
      note: `Assigned to ${associateName} (previously: ${previousAssociate}) by ${assignedBy}`,
      date: new Date().toISOString().split('T')[0],
      updatedBy: assignedBy,
    });

    return prospect.save();
  }

  async bulkAssign(ids: string[], associateName: string, assignedBy = 'Admin'): Promise<{ modifiedCount: number }> {
    const today = new Date().toISOString().split('T')[0];
    const auditRemark = {
      note: `Bulk assigned to ${associateName} by ${assignedBy}`,
      date: today,
      updatedBy: assignedBy,
    };

    const res = await this.prospectModel.updateMany(
      { _id: { $in: ids } },
      {
        $set: { associateName },
        $push: { remarks: { $each: [auditRemark], $position: 0 } },
      },
    );

    return { modifiedCount: res.modifiedCount };
  }

  async findOne(id: string): Promise<Prospect> {
    const prospect = await this.prospectModel.findById(id).exec();
    if (!prospect) {
      throw new NotFoundException(`Prospect with ID ${id} not found`);
    }
    return prospect;
  }

  async create(createDto: CreateProspectDto): Promise<Prospect> {
    const remarks = [];
    if (createDto.initialRemark) {
      remarks.push({
        note: createDto.initialRemark,
        date: new Date().toISOString().split('T')[0],
        updatedBy: createDto.associateName || 'Agent',
      });
    }

    const created = new this.prospectModel({
      ...createDto,
      remarks,
    });
    return created.save();
  }

  async update(id: string, updateDto: UpdateProspectDto): Promise<Prospect> {
    const prospect = await this.prospectModel.findById(id).exec();
    if (!prospect) {
      throw new NotFoundException(`Prospect with ID ${id} not found`);
    }

    if (updateDto.newRemark) {
      prospect.remarks.unshift({
        note: updateDto.newRemark,
        date: new Date().toISOString().split('T')[0],
        updatedBy: 'Agent',
      });
    }

    Object.assign(prospect, updateDto);
    delete (prospect as any).newRemark;

    return prospect.save();
  }

  async addRemark(id: string, note: string, updatedBy = 'Agent'): Promise<Prospect> {
    const prospect = await this.prospectModel.findById(id).exec();
    if (!prospect) {
      throw new NotFoundException(`Prospect with ID ${id} not found`);
    }

    prospect.remarks.unshift({
      note,
      date: new Date().toISOString().split('T')[0],
      updatedBy,
    });

    return prospect.save();
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const res = await this.prospectModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException(`Prospect with ID ${id} not found`);
    }
    return { success: true };
  }

  async exportCsv(associateName?: string): Promise<string> {
    const filter: any = {};
    if (associateName && associateName !== 'All') {
      filter.associateName = new RegExp(`^${associateName.trim()}$`, 'i');
    }
    const leads = await this.prospectModel.find(filter).sort({ createdAt: -1 }).exec();
    const headers = [
      'Client Name',
      'Contact',
      'Email',
      'Lead Type',
      'Status',
      'Project',
      'Budget',
      'Assigned Associate',
      'Address',
      'Due Date',
      'Created At',
    ];
    const rows = leads.map((l) => [
      `"${(l.clientName || '').replace(/"/g, '""')}"`,
      `"${(l.contact || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.type || '').replace(/"/g, '""')}"`,
      `"${(l.status || '').replace(/"/g, '""')}"`,
      `"${(l.project || '').replace(/"/g, '""')}"`,
      `"${(l.budget || '').replace(/"/g, '""')}"`,
      `"${(l.associateName || '').replace(/"/g, '""')}"`,
      `"${(l.address || '').replace(/"/g, '""')}"`,
      `"${(l.dueDate || '').replace(/"/g, '""')}"`,
      `"${(l as any).createdAt ? new Date((l as any).createdAt).toLocaleDateString() : ''}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  async bulkImport(
    leads: any[],
    defaultAssociate = 'Vibha',
    importedBy = 'Admin',
  ): Promise<{ success: boolean; count: number; imported: any[]; skipped: number }> {
    if (!Array.isArray(leads) || leads.length === 0) {
      return { success: false, count: 0, imported: [], skipped: 0 };
    }

    const validLeads: any[] = [];
    let skipped = 0;

    for (const item of leads) {
      const name = (item.clientName || item.name || item.fullName || item['Client Name'] || item['Name'] || '').trim();
      const phone = (item.contact || item.phone || item.mobile || item['Contact'] || item['Phone'] || item['Mobile'] || '').trim();

      if (!name && !phone) {
        skipped++;
        continue;
      }

      const clientName = name || `Lead ${phone.slice(-4) || 'New'}`;
      const contact = phone || 'N/A';
      const email = (item.email || item['Email'] || '').trim();
      const project = (item.project || item['Project'] || item.property || '').trim();
      const budget = (item.budget || item['Budget'] || '').trim();
      const status = (item.status || item['Status'] || 'Hot').trim();
      const type = (item.type || item['Lead Type'] || 'Hot').trim();
      const associateName = (item.associateName || item.associate || item['Assigned Associate'] || defaultAssociate || 'Vibha').trim();
      const address = (item.address || item['Address'] || item.city || '').trim();
      const occupation = (item.occupation || item['Occupation'] || '').trim();
      const notes = (item.notes || item.remarks || item.remark || item['Notes'] || '').trim();

      validLeads.push({
        clientName,
        contact,
        email,
        project,
        budget,
        status,
        type,
        associateName,
        address,
        occupation,
        date: new Date().toISOString().split('T')[0],
        remarks: notes ? [{ note: notes, date: new Date().toISOString().split('T')[0], updatedBy: importedBy }] : [],
      });
    }

    if (validLeads.length === 0) {
      return { success: false, count: 0, imported: [], skipped };
    }

    const inserted = await this.prospectModel.insertMany(validLeads);
    return {
      success: true,
      count: inserted.length,
      imported: inserted,
      skipped,
    };
  }
}
