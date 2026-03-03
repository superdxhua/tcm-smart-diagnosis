import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class SignInService {
  private supabase = getSupabaseClient();

  // 每日签到基础积分
  private readonly DAILY_SIGN_IN_POINTS = 10;

  // 连续签到奖励
  private readonly CONSECUTIVE_7_DAYS_BONUS = 20; // 连续7天额外奖励20积分
  private readonly CONSECUTIVE_30_DAYS_BONUS = 100; // 连续30天额外奖励100积分

  /**
   * 签到
   * @param userId 用户ID
   * @returns 签到结果
   */
  async signIn(userId: string): Promise<{
    pointsAwarded: number;
    bonusPoints: number;
    consecutiveDays: number;
    isBonusDay: boolean;
    totalPoints: number;
    availablePoints: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    // 检查今天是否已签到
    const { data: existingRecord, error: checkError } = await this.supabase
      .from('sign_in_records')
      .select('*')
      .eq('user_id', userId)
      .gte('sign_in_date', todayIso)
      .single();

    if (existingRecord) {
      throw new BadRequestException('今天已经签到过了，明天再来吧！');
    }

    // 计算连续签到天数
    const consecutiveDays = await this.calculateConsecutiveDays(userId, today);

    // 计算奖励积分
    let pointsAwarded = this.DAILY_SIGN_IN_POINTS;
    let bonusPoints = 0;
    let isBonusDay = false;

    // 检查是否是奖励日
    if (consecutiveDays === 7) {
      bonusPoints = this.CONSECUTIVE_7_DAYS_BONUS;
      isBonusDay = true;
      pointsAwarded += bonusPoints;
    } else if (consecutiveDays === 30) {
      bonusPoints = this.CONSECUTIVE_30_DAYS_BONUS;
      isBonusDay = true;
      pointsAwarded += bonusPoints;
    }

    // 创建签到记录
    const { error: recordError } = await this.supabase
      .from('sign_in_records')
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        sign_in_date: new Date().toISOString(),
        points_awarded: pointsAwarded,
        consecutive_days: consecutiveDays,
        is_bonus_day: isBonusDay,
        bonus_points: bonusPoints,
      });

    if (recordError) {
      console.error('创建签到记录失败:', recordError);
      throw new BadRequestException('签到失败');
    }

    // 更新用户积分
    const { totalPoints, availablePoints } = await this.addPoints(userId, pointsAwarded);

    return {
      pointsAwarded,
      bonusPoints,
      consecutiveDays,
      isBonusDay,
      totalPoints,
      availablePoints,
    };
  }

  /**
   * 计算连续签到天数
   * @param userId 用户ID
   * @param today 今天日期
   * @returns 连续签到天数
   */
  private async calculateConsecutiveDays(userId: string, today: Date): Promise<number> {
    // 检查昨天是否签到
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayIso = new Date(yesterday).toISOString();

    const { data: yesterdayRecord } = await this.supabase
      .from('sign_in_records')
      .select('*')
      .eq('user_id', userId)
      .gte('sign_in_date', yesterdayIso)
      .lt('sign_in_date', today.toISOString())
      .single();

    if (!yesterdayRecord) {
      // 昨天没签到，连续天数清零（重新开始计数，从1开始）
      return 1;
    }

    // 昨天签到了，连续天数 = 昨天的连续天数 + 1
    return yesterdayRecord.consecutive_days + 1;
  }

  /**
   * 添加积分
   * @param userId 用户ID
   * @param points 积分数量
   * @returns 更新后的积分余额
   */
  private async addPoints(userId: string, points: number): Promise<{
    totalPoints: number;
    availablePoints: number;
  }> {
    // 查询现有积分余额
    const { data: existingPoints } = await this.supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    let totalPoints: number;
    let availablePoints: number;

    if (existingPoints) {
      // 更新现有积分
      totalPoints = existingPoints.total_points + points;
      availablePoints = existingPoints.available_points + points;

      const { error } = await this.supabase
        .from('user_points')
        .update({
          total_points: totalPoints,
          available_points: availablePoints,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('更新积分失败:', error);
        throw new BadRequestException('更新积分失败');
      }
    } else {
      // 创建新的积分记录
      totalPoints = points;
      availablePoints = points;

      const { error } = await this.supabase
        .from('user_points')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          total_points: totalPoints,
          available_points: availablePoints,
          used_points: 0,
        });

      if (error) {
        console.error('创建积分记录失败:', error);
        throw new BadRequestException('创建积分记录失败');
      }
    }

    return { totalPoints, availablePoints };
  }

  /**
   * 查询用户签到历史
   * @param userId 用户ID
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 签到历史记录
   */
  async getSignInHistory(
    userId: string,
    page: number = 1,
    pageSize: number = 30
  ): Promise<{
    records: any[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const offset = (page - 1) * pageSize;

    // 查询总记录数
    const { count } = await this.supabase
      .from('sign_in_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // 查询记录
    const { data: records } = await this.supabase
      .from('sign_in_records')
      .select('*')
      .eq('user_id', userId)
      .order('sign_in_date', { ascending: false })
      .range(offset, offset + pageSize - 1);

    return {
      records: records || [],
      total: count || 0,
      page,
      pageSize,
    };
  }

  /**
   * 查询签到统计
   * @param userId 用户ID
   * @returns 签到统计数据
   */
  async getSignInStats(userId: string): Promise<{
    totalDays: number;
    currentConsecutiveDays: number;
    maxConsecutiveDays: number;
    totalPointsEarned: number;
    todaySignedIn: boolean;
  }> {
    // 查询今天是否已签到
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    const { data: todayRecord } = await this.supabase
      .from('sign_in_records')
      .select('*')
      .eq('user_id', userId)
      .gte('sign_in_date', todayIso)
      .single();

    // 查询总签到天数
    const { count: totalDays } = await this.supabase
      .from('sign_in_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // 查询最近一次签到记录，获取当前连续天数
    const { data: latestRecord } = await this.supabase
      .from('sign_in_records')
      .select('*')
      .eq('user_id', userId)
      .order('sign_in_date', { ascending: false })
      .limit(1)
      .single();

    // 计算最大连续签到天数
    const { data: allRecords } = await this.supabase
      .from('sign_in_records')
      .select('consecutive_days')
      .eq('user_id', userId)
      .order('sign_in_date', { ascending: false });

    const maxConsecutiveDays = allRecords?.reduce((max, record) => {
      return Math.max(max, record.consecutive_days);
    }, 0) || 0;

    // 计算总获得积分
    const { data: stats } = await this.supabase
      .from('sign_in_records')
      .select('points_awarded, bonus_points')
      .eq('user_id', userId);

    const totalPointsEarned = stats?.reduce((sum, record) => {
      return sum + record.points_awarded + record.bonus_points;
    }, 0) || 0;

    // 计算当前连续天数（如果今天没签到，需要检查是否断签）
    let currentConsecutiveDays = 0;
    if (latestRecord) {
      const lastSignInDate = new Date(latestRecord.sign_in_date);
      const diffDays = Math.floor((today.getTime() - lastSignInDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // 今天签到，使用记录中的连续天数
        currentConsecutiveDays = latestRecord.consecutive_days;
      } else if (diffDays === 1) {
        // 昨天签到，连续天数保持
        currentConsecutiveDays = latestRecord.consecutive_days;
      } else {
        // 断签超过1天，连续天数清零
        currentConsecutiveDays = 0;
      }
    }

    return {
      totalDays: totalDays || 0,
      currentConsecutiveDays,
      maxConsecutiveDays,
      totalPointsEarned,
      todaySignedIn: !!todayRecord,
    };
  }

  /**
   * 查询用户积分余额
   * @param userId 用户ID
   * @returns 积分余额
   */
  async getPointsBalance(userId: string): Promise<{
    totalPoints: number;
    availablePoints: number;
    usedPoints: number;
  }> {
    const { data: points } = await this.supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!points) {
      // 如果没有积分记录，返回0
      return {
        totalPoints: 0,
        availablePoints: 0,
        usedPoints: 0,
      };
    }

    return {
      totalPoints: points.total_points,
      availablePoints: points.available_points,
      usedPoints: points.used_points,
    };
  }
}
