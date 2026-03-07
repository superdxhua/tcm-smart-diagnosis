import { Injectable } from '@nestjs/common';

export interface HighRiskUser {
  id: string;
  email: string;
  abuseCount: number;
  lastAbuseAt: string;
}

export interface AbuseRecord {
  id: string;
  userId: string;
  type: string;
  description: string;
  createdAt: string;
}

@Injectable()
export class AbuseDetectionService {
  /**
   * 获取高风险用户列表
   */
  async getHighRiskUsers(days: number): Promise<HighRiskUser[]> {
    // TODO: 实现实际的高风险用户查询逻辑
    return [];
  }

  /**
   * 获取指定用户的异常检测记录
   */
  async getAbuseDetectionRecords(userId: string, limit: number): Promise<AbuseRecord[]> {
    // TODO: 实现实际的异常检测记录查询逻辑
    return [];
  }
}
