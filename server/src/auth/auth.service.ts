import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import * as bcrypt from 'bcrypt';
import { LoginRequest, RegisterRequest, AuthorizeUserRequest, UpdateUserRequest, UserInfo } from './auth.interfaces';
import { SessionService } from './session.service';
import { S3Storage } from 'coze-coding-dev-sdk';
import { Express } from 'express';

@Injectable()
export class AuthService {
  private supabase = getSupabaseClient();

  constructor(private readonly sessionService: SessionService) {}

  /**
   * 微信一键登录
   */
  async wechatLogin(
    code: string,
    sessionInfo?: {
      ipAddress: string;
      userAgent?: string;
    }
  ): Promise<{ token: string; user: UserInfo }> {
    const WECHAT_APPID = process.env.WECHAT_APPID || '';
    const WECHAT_SECRET = process.env.WECHAT_SECRET || '';

    if (!WECHAT_APPID || !WECHAT_SECRET) {
      throw new BadRequestException('微信登录配置未完成，请联系管理员');
    }

    // 1. 使用 code 向微信服务器换取 openid 和 session_key
    const wechatUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`;

    const wechatResponse = await fetch(wechatUrl);
    const wechatData = await wechatResponse.json() as any;

    console.log('微信响应:', wechatData);

    if (wechatData.errcode) {
      throw new BadRequestException(`微信登录失败: ${wechatData.errmsg}`);
    }

    const openid = wechatData.openid;
    const sessionKey = wechatData.session_key;

    // 2. 查询是否已有该 openid 的用户
    const { data: existingUser, error: findError } = await this.supabase
      .from('users')
      .select('*')
      .eq('openid', openid)
      .single();

    let user: any;

    if (!findError && existingUser) {
      // 用户已存在，更新 session_key
      user = existingUser;

      await this.supabase
        .from('users')
        .update({ session_key: sessionKey })
        .eq('id', user.id);
    } else {
      // 新用户，创建账号
      // 检查 users 表是否有 openid 字段
      const { data: tableInfo, error: tableError } = await this.supabase
        .from('users')
        .select('*')
        .limit(0);

      // 尝试创建新用户
      const username = `wx_${openid.substring(0, 8)}`; // 使用 openid 前 8 位作为用户名
      const defaultPassword = await bcrypt.hash('123456', 10); // 默认密码

      const { data: newUser, error: createError } = await this.supabase
        .from('users')
        .insert({
          username,
          password: defaultPassword,
          openid,
          session_key: sessionKey,
          role: 'individual',
          is_active: true,
        })
        .select()
        .single();

      if (createError) {
        console.error('创建用户失败:', createError);
        throw new BadRequestException('创建用户失败，请稍后重试');
      }

      user = newUser;

      // 自动创建3天使用期限
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3);

      await this.supabase
        .from('user_permissions')
        .insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          is_active: true,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
        });
    }

    // 3. 生成 token
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      username: user.username,
      role: user.role,
      openid: user.openid,
    })).toString('base64');

    // 4. 创建会话记录
    if (sessionInfo?.ipAddress) {
      try {
        await this.sessionService.createSession(
          user.id,
          token,
          sessionInfo.ipAddress,
          sessionInfo.userAgent
        );
      } catch (error) {
        console.error('创建会话失败:', error.message);
      }
    }

    // 5. 查询用户权限
    let expiresAt: string | null = null;
    if (user.role !== 'admin') {
      const { data: permissions } = await this.supabase
        .from('user_permissions')
        .select('expires_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (permissions && permissions.expires_at) {
        expiresAt = permissions.expires_at;
      }
    }

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        expiresAt,
      },
    };
  }

  async login(
    request: LoginRequest,
    sessionInfo?: {
      ipAddress: string;
      userAgent?: string;
    }
  ): Promise<{ token: string; user: UserInfo }> {
    const { username, password } = request;

    console.log('=== 登录调试信息 ===');
    console.log('用户名:', username);
    console.log('密码长度:', password ? password.length : 0);
    console.log('IP地址:', sessionInfo?.ipAddress);

    // 查询用户
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    console.log('数据库查询错误:', error);
    console.log('数据库查询结果:', user ? '找到用户' : '未找到用户');

    if (error || !user) {
      console.log('抛出异常: 用户名或密码错误（用户不存在）');
      throw new UnauthorizedException('用户名或密码错误');
    }

    console.log('用户ID:', user.id);
    console.log('用户角色:', user.role);
    console.log('是否激活:', user.is_active);

    if (!user.is_active) {
      console.log('抛出异常: 账户已被禁用');
      throw new UnauthorizedException('账户已被禁用');
    }

    // 检查机构用户审核状态
    if (user.role === 'institution') {
      if (user.audit_status === 'pending') {
        console.log('抛出异常: 机构账户正在审核中');
        throw new UnauthorizedException('机构账户正在审核中，请等待管理员审核');
      }
      if (user.audit_status === 'rejected') {
        console.log('抛出异常: 机构账户审核未通过');
        throw new UnauthorizedException('机构账户审核未通过，请联系管理员');
      }
    }

    // 验证密码
    console.log('数据库密码哈希:', user.password);
    console.log('开始验证密码...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('密码验证结果:', isValidPassword);

    if (!isValidPassword) {
      console.log('抛出异常: 用户名或密码错误（密码错误）');
      throw new UnauthorizedException('用户名或密码错误');
    }

    console.log('密码验证成功！继续登录流程...');

    // 检查授权状态（仅对个体用户）
    if (user.role === 'individual') {
      const { data: permissions } = await this.supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!permissions) {
        throw new UnauthorizedException('该账户未授权使用，请联系管理员');
      }

      // 检查是否过期
      if (permissions.expires_at && new Date(permissions.expires_at) < new Date()) {
        throw new UnauthorizedException('账户授权已过期，请联系管理员续费');
      }
    }

    // 检查是否有其他IP的活跃会话（仅对普通用户）
    if (user.role !== 'admin' && sessionInfo?.ipAddress) {
      const hasConflict = await this.sessionService.hasConflictSession(user.id, sessionInfo.ipAddress);

      if (hasConflict) {
        // 获取冲突会话详情
        const conflictSessions = await this.sessionService.getConflictSessions(user.id, sessionInfo.ipAddress);
        const conflictIps = conflictSessions.map(s => s.ip_address).join(', ');

        throw new UnauthorizedException(
          `该账号已在其他设备（IP: ${conflictIps}）登录，请先退出后再试。如需更换设备，请联系管理员。`
        );
      }
    }

    // 生成 token（简单实现，实际应使用 JWT）
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      username: user.username,
      role: user.role,
    })).toString('base64');

    // 创建会话记录
    if (sessionInfo?.ipAddress) {
      try {
        await this.sessionService.createSession(
          user.id,
          token,
          sessionInfo.ipAddress,
          sessionInfo.userAgent
        );
      } catch (error) {
        console.error('创建会话失败:', error.message);
        // 即使会话创建失败，也允许登录（降级处理）
      }
    }

    // 查询用户权限（获取过期日期）
    let expiresAt: string | null = null;
    if (user.role !== 'admin') {
      console.log('查询用户权限，userId:', user.id);
      const { data: permissions, error: permError } = await this.supabase
        .from('user_permissions')
        .select('expires_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      console.log('权限查询结果:', { permissions, permError });

      if (permError) {
        console.error('查询用户权限失败:', permError);
      } else if (permissions && permissions.expires_at) {
        expiresAt = permissions.expires_at;
        console.log('获取到过期日期:', expiresAt);
      } else {
        console.log('用户没有权限记录或过期日期为空');
      }
    }

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        auditStatus: user.audit_status, // 添加审核状态
        isActive: user.is_active,
        createdAt: user.created_at,
        expiresAt: expiresAt,
      },
    };
  }

  async register(request: RegisterRequest): Promise<UserInfo> {
    const { username, password, role = 'individual', email } = request;

    // 检查用户名是否已存在
    const { data: existingUser } = await this.supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const { data: user, error } = await this.supabase
      .from('users')
      .insert({
        username,
        password: hashedPassword,
        role,
        email,
        // 机构用户默认审核状态为 pending
        audit_status: role === 'institution' ? 'pending' : null,
      })
      .select()
      .single();

    if (error || !user) {
      throw new BadRequestException('注册失败');
    }

    // 为普通个体用户自动创建3天使用期限
    if (role === 'individual') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3); // 3天后过期

      await this.supabase
        .from('user_permissions')
        .insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          is_active: true,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
        });
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      auditStatus: user.audit_status,
      isActive: user.is_active,
      createdAt: user.created_at,
    };
  }

  async authorizeUser(request: AuthorizeUserRequest, adminId: string): Promise<void> {
    const { userId, expiresAt } = request;

    // 检查目标用户是否存在
    const { data: targetUser } = await this.supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!targetUser) {
      throw new BadRequestException('用户不存在');
    }

    if (targetUser.role === 'admin') {
      throw new BadRequestException('不能授权管理员账户');
    }

    // 检查是否已有授权记录
    const { data: existingPermission } = await this.supabase
      .from('user_permissions')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingPermission) {
      // 更新现有授权
      await this.supabase
        .from('user_permissions')
        .update({
          authorized_by: adminId,
          expires_at: expiresAt,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPermission.id);
    } else {
      // 创建新授权
      await this.supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          authorized_by: adminId,
          expires_at: expiresAt,
        });
    }
  }

  async getAllUsers(): Promise<UserInfo[]> {
    const { data: users } = await this.supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    const result: UserInfo[] = []

    for (const user of users || []) {
      let expiresAt: string | undefined = undefined

      // 获取用户的使用期限
      if (user.role !== 'admin') {
        const { data: permission } = await this.supabase
          .from('user_permissions')
          .select('expires_at')
          .eq('user_id', user.id)
          .single()

        expiresAt = permission?.expires_at
      }

      result.push({
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        expiresAt,
        password: user.password, // 返回密码哈希值
      })
    }

    return result
  }

  async getUserPermissions(userId: string): Promise<any[]> {
    const { data: permissions } = await this.supabase
      .from('user_permissions')
      .select(`
        *,
        users!user_permissions_authorized_by_fkey (
          username
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return permissions || [];
  }

  async updatePermission(permissionId: string, expiresAt?: string, isActive?: boolean): Promise<void> {
    const updateData: any = {};
    if (expiresAt !== undefined) {
      updateData.expires_at = expiresAt;
    }
    if (isActive !== undefined) {
      updateData.is_active = isActive;
    }
    updateData.updated_at = new Date().toISOString();

    const { error } = await this.supabase
      .from('user_permissions')
      .update(updateData)
      .eq('id', permissionId);

    if (error) {
      throw new BadRequestException('更新权限失败');
    }
  }

  async verifyToken(token: string): Promise<UserInfo> {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      const { data: user } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single();

      if (!user || !user.is_active) {
        throw new UnauthorizedException('无效的 token');
      }

      return {
        id: user.id,
        username: user.username,
        role: user.role,
        auditStatus: user.audit_status, // 添加审核状态
        isActive: user.is_active,
        createdAt: user.created_at,
      };
    } catch (error) {
      throw new UnauthorizedException('无效的 token');
    }
  }

  /**
   * 退出登录（删除会话）
   * @param token 登录token
   */
  async logout(token: string): Promise<void> {
    try {
      await this.sessionService.invalidateSessionByToken(token);
    } catch (error) {
      console.error('退出登录失败:', error.message);
      throw new BadRequestException('退出登录失败');
    }
  }

  /**
   * 机构用户上传资质证明
   */
  async uploadQualifications(userId: string, qualifications: {
    institutionLicense: string;
    practiceLicense: string;
    physicianCert: string;
  }): Promise<void> {
    // 检查用户是否为机构用户
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('role, audit_status')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new BadRequestException('用户不存在');
    }

    if (user.role !== 'institution') {
      throw new BadRequestException('仅机构用户可上传资质证明');
    }

    // 更新资质证明信息
    const { error: updateError } = await this.supabase
      .from('users')
      .update({
        institution_license: qualifications.institutionLicense,
        practice_license: qualifications.practiceLicense,
        physician_cert: qualifications.physicianCert,
        audit_status: 'pending', // 重新提交资质证明后，审核状态改为待审核
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw new BadRequestException('上传资质证明失败');
    }
  }

  /**
   * 管理员审核机构用户
   */
  async auditUser(adminId: string, auditRequest: {
    userId: string;
    auditStatus: 'approved' | 'rejected';
    auditRemark?: string;
  }): Promise<void> {
    const { userId, auditStatus, auditRemark } = auditRequest;

    // 检查目标用户是否为机构用户
    const { data: targetUser, error: userError } = await this.supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !targetUser) {
      throw new BadRequestException('用户不存在');
    }

    if (targetUser.role !== 'institution') {
      throw new BadRequestException('仅机构用户需要审核');
    }

    // 检查资质证明是否已上传
    const { data: userWithQualifications } = await this.supabase
      .from('users')
      .select('institution_license, practice_license, physician_cert')
      .eq('id', userId)
      .single();

    if (!userWithQualifications?.institution_license ||
        !userWithQualifications?.practice_license ||
        !userWithQualifications?.physician_cert) {
      throw new BadRequestException('用户未上传完整资质证明，无法审核');
    }

    // 审核通过时，自动创建使用期限（默认3天）
    if (auditStatus === 'approved') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3); // 3天后过期

      // 检查是否已有授权记录
      const { data: existingPermission } = await this.supabase
        .from('user_permissions')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingPermission) {
        // 更新现有授权
        await this.supabase
          .from('user_permissions')
          .update({
            authorized_by: adminId,
            expires_at: expiresAt.toISOString(),
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPermission.id);
      } else {
        // 创建新授权
        await this.supabase
          .from('user_permissions')
          .insert({
            id: crypto.randomUUID(),
            user_id: userId,
            authorized_by: adminId,
            expires_at: expiresAt.toISOString(),
            is_active: true,
            created_at: new Date().toISOString(),
          });
      }
    } else {
      // 审核拒绝，禁用授权
      await this.supabase
        .from('user_permissions')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    }

    // 更新用户审核状态
    const { error: updateError } = await this.supabase
      .from('users')
      .update({
        audit_status: auditStatus,
        audit_remark: auditRemark,
        audited_at: new Date().toISOString(),
        audited_by: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw new BadRequestException('审核失败');
    }
  }

  /**
   * 获取待审核的机构用户列表
   */
  async getPendingInstitutions(): Promise<any[]> {
    const { data: users } = await this.supabase
      .from('users')
      .select('id, username, email, created_at, institution_license, practice_license, physician_cert')
      .eq('role', 'institution')
      .eq('audit_status', 'pending')
      .order('created_at', { ascending: false });

    return users || [];
  }

  /**
   * 更新用户信息（用户名和密码）
   */
  async updateUser(request: UpdateUserRequest, currentUserId: string): Promise<{ username: string }> {
    const { userId, username, currentPassword, newPassword } = request;

    // 验证用户只能修改自己的信息
    if (userId !== currentUserId) {
      throw new BadRequestException('只能修改自己的账户信息');
    }

    // 查询用户
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new BadRequestException('用户不存在');
    }

    // 更新用户名
    if (username && username !== user.username) {
      // 检查用户名是否已存在
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (existingUser) {
        throw new BadRequestException('用户名已被使用');
      }

      const { error: updateError } = await this.supabase
        .from('users')
        .update({
          username,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        throw new BadRequestException('更新用户名失败');
      }
    }

    // 更新密码
    if (newPassword) {
      if (!currentPassword) {
        throw new BadRequestException('修改密码需要提供当前密码');
      }

      // 验证当前密码
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new BadRequestException('当前密码错误');
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const { error: updateError } = await this.supabase
        .from('users')
        .update({
          password: hashedPassword,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        throw new BadRequestException('更新密码失败');
      }
    }

    // 返回更新后的用户信息
    const { data: updatedUser } = await this.supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    return {
      username: updatedUser?.username || username || user.username,
    };
  }

  /**
   * 小程序端手机号授权注册
   * @param code 微信小程序授权码
   * @returns token 和用户信息
   */
  async registerWeapp(code: string): Promise<{ token: string; user: UserInfo }> {
    // TODO: 调用微信 API 解析授权码获取手机号
    // 这里暂时使用 mock 数据，实际需要调用微信 API
    // const phoneInfo = await this.getWeappPhoneNumber(code);

    // 临时方案：使用时间戳生成唯一手机号（仅用于测试）
    const phoneNumber = `1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;

    // 检查用户名是否已存在
    const { data: existingUser } = await this.supabase
      .from('users')
      .select('id')
      .eq('username', phoneNumber)
      .single();

    // 如果用户已存在，直接登录
    if (existingUser) {
      return this.login({ username: phoneNumber, password: '123456' });
    }

    // 创建新用户
    const hashedPassword = await bcrypt.hash('123456', 10);

    const { data: user, error } = await this.supabase
      .from('users')
      .insert({
        username: phoneNumber,
        password: hashedPassword,
        role: 'individual',
        is_active: true,
      })
      .select()
      .single();

    if (error || !user) {
      throw new BadRequestException('注册失败');
    }

    // 自动创建3天使用期限
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    await this.supabase
      .from('user_permissions')
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        is_active: true,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });

    // 生成 token
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      username: user.username,
      role: user.role,
    })).toString('base64');

    // 查询用户权限
    const { data: permissions } = await this.supabase
      .from('user_permissions')
      .select('expires_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        expiresAt: permissions?.expires_at || null,
      },
    };
  }

  /**
   * H5 端手机号注册
   * @param phone 手机号
   * @returns token 和用户信息
   */
  async registerPhone(phone: string): Promise<{ token: string; user: UserInfo }> {
    // 检查用户名是否已存在
    const { data: existingUser, error: checkError } = await this.supabase
      .from('users')
      .select('id')
      .eq('username', phone)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('检查用户失败:', checkError);
      throw new BadRequestException('检查用户失败');
    }

    // 如果用户已存在，直接登录
    if (existingUser) {
      return this.login({ username: phone, password: '123456' });
    }

    // 创建新用户
    const hashedPassword = await bcrypt.hash('123456', 10);

    console.log('开始创建用户:', phone);

    const { data: user, error: insertError } = await this.supabase
      .from('users')
      .insert({
        username: phone,
        password: hashedPassword,
        role: 'individual',
        is_active: true,
      })
      .select()
      .single();

    console.log('创建用户结果:', { user, insertError });

    if (insertError || !user) {
      console.error('创建用户失败:', insertError);
      throw new BadRequestException(`注册失败: ${insertError?.message || '未知错误'}`);
    }

    // 自动创建3天使用期限
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    const { error: permError } = await this.supabase
      .from('user_permissions')
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        is_active: true,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });

    if (permError) {
      console.error('创建用户权限失败:', permError);
    }

    // 生成 token
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      username: user.username,
      role: user.role,
    })).toString('base64');

    // 查询用户权限
    const { data: permissions } = await this.supabase
      .from('user_permissions')
      .select('expires_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        expiresAt: permissions?.expires_at || null,
      },
    };
  }

  /**
   * 上传资质文件到对象存储
   */
  async uploadQualificationFile(
    file: Express.Multer.File,
    type: string,
  ): Promise<{ url: string; key: string }> {
    console.log('上传资质文件:', type, '大小:', file.buffer.length);

    try {
      // 初始化 S3Storage
      const storage = new S3Storage({
        bucketName: process.env.COZE_BUCKET_NAME,
        region: 'cn-beijing',
      });

      // 上传文件
      const fileKey = await storage.uploadFile({
        fileContent: file.buffer,
        fileName: `qualifications/${type}/${Date.now()}_${file.originalname}`,
        contentType: file.mimetype,
      });

      console.log('资质文件上传成功:', fileKey);

      // 生成签名 URL（有效期 30 天）
      const fileUrl = await storage.generatePresignedUrl({
        key: fileKey,
        expireTime: 2592000, // 30 天
      });

      console.log('资质文件 URL 生成成功:', fileUrl);

      return {
        url: fileUrl,
        key: fileKey,
      };
    } catch (error) {
      console.error('上传资质文件失败:', error);
      throw new BadRequestException('上传资质文件失败: ' + error.message);
    }
  }

  /**
   * 注册机构账户
   */
  async registerInstitution(body: {
    phone: string;
    qualifications: {
      institutionLicense: string;
      practiceLicense: string;
      physicianCert: string;
    };
  }): Promise<{ token: string; user: UserInfo }> {
    const { phone, qualifications } = body;

    console.log('注册机构账户:', phone);

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      throw new BadRequestException('手机号格式不正确');
    }

    // 验证资质文件
    if (!qualifications.institutionLicense || !qualifications.practiceLicense || !qualifications.physicianCert) {
      throw new BadRequestException('请上传完整的资质证明');
    }

    // 检查账户是否已存在
    const { data: existingUser, error: checkError } = await this.supabase
      .from('users')
      .select('id')
      .eq('username', phone)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('检查账户失败:', checkError);
      throw new BadRequestException('检查账户失败');
    }

    // 如果账户已存在，提示账户登录
    if (existingUser) {
      throw new BadRequestException('该手机号已注册，请直接登录');
    }

    // 创建新账户
    const hashedPassword = await bcrypt.hash('123456', 10);

    const { data: user, error: insertError } = await this.supabase
      .from('users')
      .insert({
        username: phone,
        password: hashedPassword,
        role: 'institution',
        is_active: true,
        audit_status: 'pending', // 待审核状态
        institution_license: qualifications.institutionLicense,
        practice_license: qualifications.practiceLicense,
        physician_cert: qualifications.physicianCert,
      })
      .select()
      .single();

    console.log('创建机构账户结果:', { user, insertError });

    if (insertError || !user) {
      console.error('创建机构账户失败:', insertError);
      throw new BadRequestException(`注册失败: ${insertError?.message || '未知错误'}`);
    }

    console.log('机构账户注册成功，等待审核:', user.id);

    // 生成 token
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      username: user.username,
      role: user.role,
    })).toString('base64');

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        expiresAt: null, // 机构账户不需要 expiresAt
      },
    };
  }
}
