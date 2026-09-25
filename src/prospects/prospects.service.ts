import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as XLSX from 'xlsx';
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

    const getField = (row: Record<string, any>, keys: string[]): string => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
          return String(row[k]).trim();
        }
      }
      const rowKeys = Object.keys(row);
      for (const target of keys) {
        const normTarget = target.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const k of rowKeys) {
          const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (normK === normTarget && row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
            return String(row[k]).trim();
          }
        }
      }
      return '';
    };

    for (const item of leads) {
      if (typeof item !== 'object' || !item) {
        skipped++;
        continue;
      }

      const name = getField(item, [
        'clientName', 'client_name', 'name', 'fullName', 'full_name',
        'Client Name', 'Name', 'Customer Name', 'Customer', 'Lead Name', 'Buyer Name'
      ]);

      const phone = getField(item, [
        'contact', 'phone', 'mobile', 'phoneNumber', 'phone_number', 'contact_no', 'mobile_no',
        'Contact', 'Phone', 'Mobile', 'Contact Number', 'Phone Number', 'Mobile Number', 'Mobile No'
      ]);

      if (!name && !phone) {
        skipped++;
        continue;
      }

      const clientName = name || `Lead ${phone.slice(-4) || 'New'}`;
      const contact = phone || 'N/A';
      const email = getField(item, ['email', 'email_id', 'Email', 'Email ID', 'Email Address', 'Mail']);
      const project = getField(item, ['project', 'property', 'project_name', 'Project', 'Property', 'Project Name', 'Interested In', 'Society']);
      const budget = getField(item, ['budget', 'price', 'budget_range', 'Budget', 'Price', 'Budget Range', 'Cost']);
      const rawStatus = getField(item, ['status', 'lead_status', 'Status', 'Lead Status', 'Stage']);
      const rawType = getField(item, ['type', 'lead_type', 'Lead Type', 'Category']);

      const validTypes = ['Hot', 'Warm', 'Cold', 'Not Interested'];
      const validStatuses = ['Active', 'Converted', 'Dropped', 'Pending'];
      const matchIn = (val: string, list: string[]) => list.find(x => x.toLowerCase() === val.toLowerCase());

      let type = 'Hot';
      let status = 'Active';

      if (rawType && matchIn(rawType, validTypes)) {
        type = matchIn(rawType, validTypes)!;
      } else if (rawStatus && matchIn(rawStatus, validTypes)) {
        type = matchIn(rawStatus, validTypes)!;
      }

      if (rawStatus && matchIn(rawStatus, validStatuses)) {
        status = matchIn(rawStatus, validStatuses)!;
      } else if (rawType && matchIn(rawType, validStatuses)) {
        status = matchIn(rawType, validStatuses)!;
      }

      const associateName = getField(item, ['associateName', 'associate', 'assigned_to', 'assigned_associate', 'Assigned Associate', 'Assigned To', 'Associate', 'Agent', 'Executive']) || defaultAssociate || 'Vibha';
      const address = getField(item, ['address', 'location', 'city', 'area', 'Address', 'Location', 'City', 'Area']);
      const occupation = getField(item, ['occupation', 'profession', 'Occupation', 'Profession', 'Designation']);
      const notes = getField(item, ['notes', 'remarks', 'remark', 'comment', 'comments', 'Notes', 'Remarks', 'Remark', 'Comments']);

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

  async importFromFile(
    fileBuffer: Buffer,
    defaultAssociate = 'Vibha',
    importedBy = 'Admin',
  ): Promise<{ success: boolean; count: number; imported: any[]; skipped: number }> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new BadRequestException('The uploaded Excel or CSV file contains no readable sheets.');
    }
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    return this.bulkImport(jsonData, defaultAssociate, importedBy);
  }
}
