import Notice from '../models/Notice';
import { Types } from 'mongoose';

export class NotificationService {
  async createNotice(data: {
    title: string;
    content: string;
    targetRole?: 'all' | 'student' | 'teacher' | 'admin';
    attachmentUrl?: string;
    postedBy: string;
  }) {
    const notice = await Notice.create({
      title: data.title,
      content: data.content,
      targetRole: data.targetRole || 'all',
      attachmentUrl: data.attachmentUrl,
      postedBy: new Types.ObjectId(data.postedBy),
    });

    return await Notice.findById(notice._id).populate('postedBy', 'name role email');
  }

  async getNotices(role?: string) {
    const query: any = {};
    if (role && role !== 'admin') {
      query.targetRole = { $in: ['all', role] };
    }
    return await Notice.find(query).populate('postedBy', 'name role').sort({ createdAt: -1 });
  }

  async deleteNotice(noticeId: string) {
    return await Notice.findByIdAndDelete(noticeId);
  }
}

export default new NotificationService();
