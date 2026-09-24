import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prospect, ProspectDocument } from '../prospects/schemas/prospect.schema';
import { Meeting, MeetingDocument } from '../meetings/schemas/meeting.schema';
import { Builder, BuilderDocument } from '../builders/schemas/builder.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Prospect.name) private prospectModel: Model<ProspectDocument>,
    @InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>,
    @InjectModel(Builder.name) private builderModel: Model<BuilderDocument>,
  ) {}

  async getStats(associateName?: string) {
    const filter: any = {};
    const isFiltered = associateName && associateName !== 'All';
    if (isFiltered) {
      if (associateName === 'Unassigned') {
        filter.$or = [
          { associateName: { $exists: false } },
          { associateName: '' },
          { associateName: '0' },
        ];
      } else if (associateName.toLowerCase() === 'vibha') {
        filter.associateName = new RegExp('^vibha', 'i');
      } else {
        filter.associateName = new RegExp(`^${associateName}$`, 'i');
      }
    }

    const meetingFilter: any = {};
    if (isFiltered && associateName !== 'Unassigned') {
      meetingFilter.$or = [
        { associateName: new RegExp(`^${associateName}$`, 'i') },
        { doneBy: new RegExp(`^${associateName}$`, 'i') },
      ];
    }

    const [
      totalLeads,
      hotLeads,
      warmLeads,
      coldLeads,
      notInterestedLeads,
      convertedLeads,
      activeLeads,
      totalMeetings,
      buildersCount,
      recentLeads,
      upcomingMeetings,
    ] = await Promise.all([
      this.prospectModel.countDocuments(filter).exec(),
      this.prospectModel.countDocuments({ ...filter, type: 'Hot' }).exec(),
      this.prospectModel.countDocuments({ ...filter, type: 'Warm' }).exec(),
      this.prospectModel.countDocuments({ ...filter, type: 'Cold' }).exec(),
      this.prospectModel.countDocuments({ ...filter, type: 'Not Interested' }).exec(),
      this.prospectModel.countDocuments({ ...filter, status: 'Converted' }).exec(),
      this.prospectModel.countDocuments({ ...filter, status: { $ne: 'Converted' } }).exec(),
      this.meetingModel.countDocuments(meetingFilter).exec(),
      this.builderModel.countDocuments().exec(),
      this.prospectModel.find(filter).sort({ updatedAt: -1 }).limit(6).exec(),
      this.meetingModel.find(meetingFilter).sort({ createdAt: -1 }).limit(5).exec(),
    ]);

    const followUpsScheduled = await this.prospectModel.countDocuments({
      ...filter,
      dueDate: { $ne: '' },
    }).exec();

    // Conversion rate %
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

    // Build associates leaderboard
    const associateAgg = await this.prospectModel.aggregate([
      {
        $group: {
          _id: '$associateName',
          total: { $sum: 1 },
          hot: { $sum: { $cond: [{ $eq: ['$type', 'Hot'] }, 1, 0] } },
          warm: { $sum: { $cond: [{ $eq: ['$type', 'Warm'] }, 1, 0] } },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] } },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const leaderboardMap = new Map<string, {
      name: string;
      totalAssigned: number;
      hotLeads: number;
      warmLeads: number;
      convertedCount: number;
      meetingsCount: number;
      conversionRate: string;
    }>();

    for (const item of associateAgg) {
      let rawName = (item._id || '').trim();
      if (!rawName || rawName === '0') rawName = 'Unassigned';
      let cleanName = rawName;
      if (/^vibha/i.test(cleanName)) cleanName = 'Vibha';

      const existing = leaderboardMap.get(cleanName.toLowerCase());
      if (existing) {
        existing.totalAssigned += item.total;
        existing.hotLeads += item.hot;
        existing.warmLeads += item.warm;
        existing.convertedCount += item.converted;
      } else {
        leaderboardMap.set(cleanName.toLowerCase(), {
          name: cleanName,
          totalAssigned: item.total,
          hotLeads: item.hot,
          warmLeads: item.warm,
          convertedCount: item.converted,
          meetingsCount: 0,
          conversionRate: '0',
        });
      }
    }

    // Attach meeting counts per associate
    try {
      const meetingsAgg = await this.meetingModel.aggregate([
        {
          $group: {
            _id: '$associateName',
            total: { $sum: 1 },
          },
        },
      ]);
      for (const m of meetingsAgg) {
        let mName = (m._id || '').trim();
        if (/^vibha/i.test(mName)) mName = 'Vibha';
        const found = leaderboardMap.get(mName.toLowerCase());
        if (found) {
          found.meetingsCount += m.total;
        }
      }
    } catch (e) {
      // ignore meeting aggregation if empty
    }

    const leaderboard = Array.from(leaderboardMap.values())
      .map((rep) => {
        const rate = rep.totalAssigned > 0
          ? ((rep.convertedCount / rep.totalAssigned) * 100).toFixed(1)
          : '0.0';
        return {
          ...rep,
          conversionRate: rate,
        };
      })
      .sort((a, b) => b.totalAssigned - a.totalAssigned);

    return {
      selectedAssociate: associateName || 'All',
      totalLeads,
      hotLeads,
      warmLeads,
      coldLeads,
      notInterestedLeads,
      convertedLeads,
      activeLeads,
      conversionRate,
      totalMeetings,
      buildersCount,
      followUpsScheduled,
      recentLeads,
      upcomingMeetings,
      leaderboard,
    };
  }
}
