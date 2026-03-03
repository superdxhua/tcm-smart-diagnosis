import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';
// import { userSessions } from '@/storage/database/shared/schema'; // 不需要 Drizzle ORM，直接使用 Supabase SDK

@Injectable()
export class SessionService {
  private supabase = getSupabaseClient();

  /**
   * 创建用户会话
   * @param userId 用户ID
   * @param token 登录token
   * @param ipAddress IP地址
   * @param userAgent 用户代理
   * @returns 会话ID
   */
  async createSession(
    userId: string,
    token: string,
    ipAddress: string,
    userAgent?: string
  ): Promise<string> {
    // 计算过期时间（7天后）
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 插入新会话
    const { data: session, error } = await this.supabase
      .from('user_sessions')
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        token,
        ip_address: ipAddress,
        user_agent: userAgent || '',
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error || !session) {
      console.error('创建会话失败:', error);
      throw new Error('创建会话失败');
    }

    return session.id;
  }

  /**
   * 检查用户是否有活跃会话
   * @param userId 用户ID
   * @returns 活跃会话列表
   */
  async getActiveSessions(userId: string): Promise<any[]> {
    const { data: sessions } = await this.supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('last_active_at', { ascending: false });

    return sessions || [];
  }

  /**
   * 检查用户是否有其他IP的活跃会话
   * @param userId 用户ID
   * @param currentIpAddress 当前IP地址
   * @returns 是否有冲突
   */
  async hasConflictSession(userId: string, currentIpAddress: string): Promise<boolean> {
    const activeSessions = await this.getActiveSessions(userId);

    // 检查是否有不同IP的活跃会话
    return activeSessions.some(
      (session) => session.ip_address !== currentIpAddress
    );
  }

  /**
   * 获取冲突的会话信息
   * @param userId 用户ID
   * @param currentIpAddress 当前IP地址
   * @returns 冲突会话列表
   */
  async getConflictSessions(userId: string, currentIpAddress: string): Promise<any[]> {
    const activeSessions = await this.getActiveSessions(userId);

    // 返回所有不同IP的活跃会话
    return activeSessions.filter(
      (session) => session.ip_address !== currentIpAddress
    );
  }

  /**
   * 使所有旧会话失效（踢出所有设备）
   * @param userId 用户ID
   */
  async invalidateAllSessions(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_sessions')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('使会话失效失败:', error);
      throw new Error('使会话失效失败');
    }
  }

  /**
   * 使指定IP的会话失效（踢出指定设备）
   * @param userId 用户ID
   * @param ipAddress IP地址
   */
  async invalidateSessionByIp(userId: string, ipAddress: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_sessions')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('ip_address', ipAddress);

    if (error) {
      console.error('使会话失效失败:', error);
      throw new Error('使会话失效失败');
    }
  }

  /**
   * 验证并更新会话
   * @param token 登录token
   * @returns 用户ID（如果会话有效）
   */
  async verifyAndUpdateSession(token: string): Promise<string | null> {
    const { data: session, error } = await this.supabase
      .from('user_sessions')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (error || !session) {
      return null;
    }

    // 检查会话是否过期
    if (new Date(session.expires_at) < new Date()) {
      await this.invalidateSessionByToken(token);
      return null;
    }

    // 更新最后活跃时间
    await this.supabase
      .from('user_sessions')
      .update({
        last_active_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    return session.user_id;
  }

  /**
   * 使指定token的会话失效（登出）
   * @param token 登录token
   */
  async invalidateSessionByToken(token: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_sessions')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('token', token);

    if (error) {
      console.error('使会话失效失败:', error);
      throw new Error('使会话失效失败');
    }
  }

  /**
   * 清理过期会话（定时任务）
   */
  async cleanupExpiredSessions(): Promise<void> {
    const { data, error } = await this.supabase
      .from('user_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select();

    if (error) {
      console.error('清理过期会话失败:', error);
    } else {
      console.log(`清理了 ${data?.length || 0} 个过期会话`);
    }
  }

  /**
   * 获取用户的活跃设备列表
   * @param userId 用户ID
   * @returns 设备列表
   */
  async getUserDevices(userId: string): Promise<any[]> {
    const sessions = await this.getActiveSessions(userId);

    return sessions.map(session => ({
      sessionId: session.id,
      ipAddress: session.ip_address,
      userAgent: session.user_agent,
      lastActiveAt: session.last_active_at,
      isCurrentDevice: true, // 前端需要判断当前设备
    }));
  }
}
