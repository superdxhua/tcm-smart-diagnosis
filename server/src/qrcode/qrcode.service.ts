import { Injectable, BadRequestException } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as QRCode from 'qrcode';

interface GenerateQrcodeParams {
  platform: 'wechat' | 'alipay';
  referrerId?: string;
  expiresIn?: number; // 过期时间（秒），默认 30 天
}

interface RegisterUserParams {
  qrCode: string;
  username: string;
  password: string;
  phone?: string;
}

@Injectable()
export class QrcodeService {
  private supabase = getSupabaseClient();

  // 生成注册二维码
  async generateRegisterQrcode(params: GenerateQrcodeParams) {
    const { platform, referrerId, expiresIn = 30 * 24 * 60 * 60 } = params;

    console.log('生成注册二维码:', { platform, referrerId, expiresIn });

    // 验证平台
    if (!['wechat', 'alipay'].includes(platform)) {
      throw new BadRequestException('不支持的平台');
    }

    // 生成唯一的二维码标识
    const qrCode = `${platform.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // 计算过期时间
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // 插入二维码记录
    const { error: insertError } = await this.supabase
      .from('register_qrcodes')
      .insert({
        id: uuidv4(),
        qr_code: qrCode,
        platform,
        referrer_id: referrerId,
        expires_at: expiresAt,
        is_active: true,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('二维码生成失败:', insertError);
      throw new BadRequestException('二维码生成失败: ' + insertError.message);
    }

    console.log('二维码生成成功:', { qrCode, expiresAt });

    // 生成真实的二维码图片
    let qrCodeUrl: string;

    try {
      // 生成二维码图片的 Base64
      const qrCodeDataUrl = await QRCode.toDataURL(qrCode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // 返回 Base64 格式的二维码图片
      qrCodeUrl = qrCodeDataUrl;

      console.log('二维码图片生成成功');
    } catch (qrError) {
      console.error('二维码图片生成失败:', qrError);
      // 如果二维码图片生成失败，返回文本格式
      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`;
    }

    return {
      qrCode,
      platform,
      referrerId,
      expiresAt,
      qrImageUrl: qrCodeUrl,
    };
  }

  // 验证二维码
  async validateQrcode(qrCode: string) {
    console.log('验证二维码:', qrCode);

    const { data: qrcodes, error } = await this.supabase
      .from('register_qrcodes')
      .select('*')
      .eq('qr_code', qrCode)
      .eq('is_active', true)
      .single();

    if (error || !qrcodes) {
      throw new BadRequestException('二维码不存在或已失效');
    }

    const qrcode = qrcodes;

    // 检查是否过期
    if (qrcode.expires_at && new Date(qrcode.expires_at) < new Date()) {
      throw new BadRequestException('二维码已过期');
    }

    return qrcode;
  }

  // 通过二维码注册用户
  async registerWithQrcode(params: RegisterUserParams) {
    const { qrCode, username, password, phone } = params;

    console.log('通过二维码注册用户:', { qrCode, username, phone });

    // 验证二维码
    const qrcode = await this.validateQrcode(qrCode);

    // 检查用户名是否已存在
    const { data: existingUsers } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (existingUsers) {
      throw new BadRequestException('用户名已存在');
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const userId = uuidv4();
    const { error: insertUserError } = await this.supabase
      .from('users')
      .insert({
        id: userId,
        username,
        password: passwordHash,
        role: 'user',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertUserError) {
      console.error('用户创建失败:', insertUserError);
      throw new BadRequestException('用户创建失败: ' + insertUserError.message);
    }

    console.log('用户创建成功:', { userId, username });

    // 创建用户权限记录（默认有效期 3 天）
    const { error: insertPermError } = await this.supabase
      .from('user_permissions')
      .insert({
        id: uuidv4(),
        user_id: userId,
        authorized_by: qrcode.referrer_id || null,
        expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertPermError) {
      console.error('用户权限创建失败:', insertPermError);
      throw new BadRequestException('用户权限创建失败: ' + insertPermError.message);
    }

    console.log('用户权限创建成功');

    return {
      userId,
      username,
      platform: qrcode.platform,
      referrerId: qrcode.referrer_id,
    };
  }

  // 获取二维码列表（管理员）
  async getQrcodeList(platform?: string) {
    console.log('获取二维码列表:', { platform });

    let query = this.supabase
      .from('register_qrcodes')
      .select('*');

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('获取二维码列表失败:', error);
      throw new BadRequestException('获取二维码列表失败: ' + (error.message || error));
    }

    return data || [];
  }

  // 禁用二维码
  async disableQrcode(qrCode: string) {
    console.log('禁用二维码:', qrCode);

    const { error } = await this.supabase
      .from('register_qrcodes')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('qr_code', qrCode);

    if (error) {
      console.error('禁用二维码失败:', error);
      throw new BadRequestException('禁用二维码失败: ' + (error.message || error));
    }

    console.log('二维码禁用成功');
  }
}
