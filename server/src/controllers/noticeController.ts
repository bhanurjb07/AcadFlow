import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import notificationService from '../services/notificationService';

export const getNotices = async (req: AuthRequest, res: Response) => {
  try {
    const notices = await notificationService.getNotices(req.userRole);
    res.json({ success: true, data: notices });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createNotice = async (req: AuthRequest, res: Response) => {
  try {
    const notice = await notificationService.createNotice({
      ...req.body,
      postedBy: req.userId!,
    });
    res.status(201).json({ success: true, data: notice });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteNotice = async (req: AuthRequest, res: Response) => {
  try {
    const noticeId = String(req.params.noticeId);
    await notificationService.deleteNotice(noticeId);
    res.json({ success: true, message: 'Notice deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
