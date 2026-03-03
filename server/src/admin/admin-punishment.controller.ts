import { Controller, Post, Body, Headers, HttpException, HttpStatus, Get, Query } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export interface PunishmentRequest {
  userId: string;
  punishmentType: 'suspend' | 'ban' | 'restore';
  duration?: number; // 暂停时长（天），仅对 suspend 有效
  reason: string; // 处罚原因
}

@Controller('admin')
export class AdminPunishmentController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  /**
   * 处罚个人用户（仅管理员可用）
   */
  @Post('punish-user')
  async punishUser(
    @Body() body: PunishmentRequest,
    @Headers('authorization') authHeader: string,
  ) {
    // 验证管理员权限
    let adminUser: any;
    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 401, msg: '未授权，请先登录' },
          HttpStatus.OK,
        );
      }

      adminUser = await this.authService.verifyToken(token);
      if (adminUser.role !== 'admin') {
        throw new HttpException(
          { code: 403, msg: '权限不足，仅管理员可执行此操作' },
          HttpStatus.OK,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { code: 401, msg: '未授权，请先登录' },
        HttpStatus.OK,
      );
    }

    const { userId, punishmentType, duration, reason } = body;

    // 参数验证
    if (!userId) {
      throw new HttpException(
        { code: 400, msg: '用户 ID 不能为空' },
        HttpStatus.OK,
      );
    }

    if (!punishmentType || !['suspend', 'ban', 'restore'].includes(punishmentType)) {
      throw new HttpException(
        { code: 400, msg: '处罚类型无效，必须是 suspend、ban 或 restore' },
        HttpStatus.OK,
      );
    }

    if (!reason || reason.trim().length === 0) {
      throw new HttpException(
        { code: 400, msg: '处罚原因不能为空' },
        HttpStatus.OK,
      );
    }

    if (punishmentType === 'suspend' && (!duration || duration <= 0)) {
      throw new HttpException(
        { code: 400, msg: '暂停时长必须大于 0 天' },
        HttpStatus.OK,
      );
    }

    const supabase = getSupabaseClient();

    // 查询目标用户信息
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, username, role, phone, prescription_banned, prescription_banned_until, ban_count')
      .eq('id', userId)
      .single();

    if (userError || !targetUser) {
      throw new HttpException(
        { code: 404, msg: '目标用户不存在' },
        HttpStatus.OK,
      );
    }

    // 检查目标用户角色（仅个人用户可处罚）
    if (targetUser.role !== 'individual') {
      throw new HttpException(
        { code: 400, msg: '仅个人用户可处罚' },
        HttpStatus.OK,
      );
    }

    try {
      let updateData: any = {
        updated_at: new Date().toISOString()
      };

      let message = '';

      switch (punishmentType) {
        case 'suspend':
          // 暂停处方生成权
          const suspendedUntil = new Date();
          suspendedUntil.setDate(suspendedUntil.getDate() + duration!);
          
          updateData.prescription_banned = true;
          updateData.prescription_banned_until = suspendedUntil.toISOString();
          updateData.ban_reason = reason;
          updateData.ban_count = (targetUser.ban_count || 0) + 1;
          
          message = `已暂停用户 ${targetUser.username} 的处方生成权，时长 ${duration} 天，截止到 ${suspendedUntil.toLocaleDateString('zh-CN')}`;
          break;

        case 'ban':
          // 永久封号
          updateData.prescription_banned = true;
          updateData.prescription_banned_until = null; // NULL 表示永久
          updateData.ban_reason = reason;
          updateData.ban_count = (targetUser.ban_count || 0) + 1;
          
          message = `已永久封禁用户 ${targetUser.username}`;
          break;

        case 'restore':
          // 恢复权限
          updateData.prescription_banned = false;
          updateData.prescription_banned_until = null;
          updateData.ban_reason = null;
          
          message = `已恢复用户 ${targetUser.username} 的处方生成权`;
          break;
      }

      // 执行更新
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (updateError) {
        console.error('更新用户处罚状态失败:', updateError);
        throw new HttpException(
          { code: 500, msg: '更新失败' },
          HttpStatus.OK,
        );
      }

      // 记录处罚日志
      await this.logPunishment(userId, targetUser.id, punishmentType, reason, duration);

      return {
        code: 200,
        msg: 'success',
        data: {
          message,
          userId,
          punishmentType,
          reason,
          duration,
          newStatus: updateData
        },
      };
    } catch (error) {
      console.error('处罚用户失败:', error);
      throw new HttpException(
        {
          code: 500,
          msg: error.message || '处罚用户失败',
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 获取用户处罚状态（仅管理员可用）
   */
  @Get('user-punishment-status')
  async getUserPunishmentStatus(
    @Query('userId') userId: string,
    @Headers('authorization') authHeader: string,
  ) {
    // 验证管理员权限
    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 401, msg: '未授权，请先登录' },
          HttpStatus.OK,
        );
      }

      const user = await this.authService.verifyToken(token);
      if (user.role !== 'admin') {
        throw new HttpException(
          { code: 403, msg: '权限不足，仅管理员可访问' },
          HttpStatus.OK,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { code: 401, msg: '未授权，请先登录' },
        HttpStatus.OK,
      );
    }

    if (!userId) {
      throw new HttpException(
        { code: 400, msg: '用户 ID 不能为空' },
        HttpStatus.OK,
      );
    }

    const supabase = getSupabaseClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, role, phone, prescription_banned, prescription_banned_until, ban_reason, ban_count, abuse_count, last_sign_in_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new HttpException(
        { code: 404, msg: '用户不存在' },
        HttpStatus.OK,
      );
    }

    // 计算剩余天数
    let remainingDays: number | null = null;
    if (user.prescription_banned && user.prescription_banned_until) {
      const bannedUntil = new Date(user.prescription_banned_until);
      const now = new Date();
      const diffTime = bannedUntil.getTime() - now.getTime();
      remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (remainingDays < 0) remainingDays = 0;
    }

    return {
      code: 200,
      msg: 'success',
      data: {
        userId: user.id,
        username: user.username,
        role: user.role,
        phone: user.phone,
        prescriptionBanned: user.prescription_banned,
        prescriptionBannedUntil: user.prescription_banned_until,
        banReason: user.ban_reason,
        banCount: user.ban_count || 0,
        abuseCount: user.abuse_count || 0,
        remainingDays,
        isPermanent: user.prescription_banned && user.prescription_banned_until === null,
        lastSignInAt: user.last_sign_in_at
      },
    };
  }

  /**
   * 获取需要处罚的用户列表（基于异常检测记录）
   */
  @Get('punishment-candidates')
  async getPunishmentCandidates(
    @Headers('authorization') authHeader: string,
    @Query('days') days?: string,
  ) {
    // 验证管理员权限
    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 401, msg: '未授权，请先登录' },
          HttpStatus.OK,
        );
      }

      const user = await this.authService.verifyToken(token);
      if (user.role !== 'admin') {
        throw new HttpException(
          { code: 403, msg: '权限不足，仅管理员可访问' },
          HttpStatus.OK,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { code: 401, msg: '未授权，请先登录' },
        HttpStatus.OK,
      );
    }

    const queryDays = days ? parseInt(days, 10) : 7;
    const supabase = getSupabaseClient();

    // 查询高风险用户
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - queryDays);

    const { data: abuseRecords, error: abuseError } = await supabase
      .from('abuse_detection_records')
      .select('user_id, risk_level, detected_at')
      .gte('detected_at', startDate.toISOString())
      .in('risk_level', ['medium', 'high']);

    if (abuseError) {
      throw new HttpException(
        { code: 500, msg: '查询失败' },
        HttpStatus.OK,
      );
    }

    // 统计每个用户的异常次数
    const userStats = new Map<string, { highRiskCount: number; mediumRiskCount: number; lastDetected: string }>();

    (abuseRecords || []).forEach((record: any) => {
      const userId = record.user_id;
      if (!userStats.has(userId)) {
        userStats.set(userId, { highRiskCount: 0, mediumRiskCount: 0, lastDetected: record.detected_at });
      }
      const stats = userStats.get(userId)!;
      if (record.risk_level === 'high') {
        stats.highRiskCount++;
      } else if (record.risk_level === 'medium') {
        stats.mediumRiskCount++;
      }
      if (stats.lastDetected < record.detected_at) {
        stats.lastDetected = record.detected_at;
      }
    });

    // 获取用户详细信息
    const userIds = Array.from(userStats.keys());
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, phone, prescription_banned, prescription_banned_until, ban_count')
      .in('id', userIds);

    if (usersError) {
      throw new HttpException(
        { code: 500, msg: '查询用户信息失败' },
        HttpStatus.OK,
      );
    }

    // 组合数据并计算推荐处罚
    const candidates = (users || []).map((user: any) => {
      const stats = userStats.get(user.id)!;
      const totalRiskCount = stats.highRiskCount + stats.mediumRiskCount;

      // 推荐处罚逻辑
      let recommendedAction: string | null = null;
      let recommendedReason: string | null = null;

      if (user.prescription_banned) {
        recommendedAction = 'already_banned';
        recommendedReason = '用户已被处罚';
      } else if (stats.highRiskCount >= 5 || totalRiskCount >= 10) {
        recommendedAction = 'ban';
        recommendedReason = `高风险 ${stats.highRiskCount} 次，总异常 ${totalRiskCount} 次，建议永久封号`;
      } else if (stats.highRiskCount >= 3 || totalRiskCount >= 5) {
        recommendedAction = 'suspend';
        recommendedReason = `高风险 ${stats.highRiskCount} 次，总异常 ${totalRiskCount} 次，建议暂停 7 天`;
      } else if (stats.highRiskCount >= 1 || totalRiskCount >= 3) {
        recommendedAction = 'suspend';
        recommendedReason = `高风险 ${stats.highRiskCount} 次，总异常 ${totalRiskCount} 次，建议暂停 3 天`;
      }

      return {
        userId: user.id,
        username: user.username,
        phone: user.phone,
        highRiskCount: stats.highRiskCount,
        mediumRiskCount: stats.mediumRiskCount,
        totalRiskCount,
        lastDetected: stats.lastDetected,
        prescriptionBanned: user.prescription_banned,
        prescriptionBannedUntil: user.prescription_banned_until,
        banCount: user.ban_count || 0,
        recommendedAction,
        recommendedReason
      };
    });

    // 按总风险次数降序排序
    candidates.sort((a, b) => b.totalRiskCount - a.totalRiskCount);

    return {
      code: 200,
      msg: 'success',
      data: {
        candidates,
        total: candidates.length,
        queryPeriod: `${queryDays} 天`
      },
    };
  }

  /**
   * 记录处罚日志
   */
  private async logPunishment(
    userId: string,
    adminId: string,
    punishmentType: string,
    reason: string,
    duration?: number
  ): Promise<void> {
    const supabase = getSupabaseClient();

    try {
      const { error } = await supabase
        .from('punishment_logs')
        .insert({
          user_id: userId,
          admin_id: adminId,
          punishment_type: punishmentType,
          duration: duration || null,
          reason,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('记录处罚日志失败:', error);
      }
    } catch (err) {
      console.error('记录处罚日志异常:', err);
    }
  }
}
