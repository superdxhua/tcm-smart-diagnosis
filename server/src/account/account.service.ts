import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountService {
  // 修改用户名（email）
  async updateUsername(userId: string, newEmail: string) {
    const supabase = getSupabaseClient();

    // 检查邮箱是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', newEmail)
      .single();

    if (existingUser) {
      throw new BadRequestException('该邮箱已被使用');
    }

    // 更新用户名
    const { error } = await supabase
      .from('users')
      .update({
        email: newEmail,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { message: '用户名修改成功' };
  }

  // 修改密码
  async updatePassword(userId: string, oldPassword: string, newPassword: string) {
    const supabase = getSupabaseClient();

    // 获取用户信息
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('原密码错误');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    const { error } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { message: '密码修改成功' };
  }

  // 获取用户信息
  async getUserInfo(userId: string) {
    const supabase = getSupabaseClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, role, is_active, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      id: user.id,
      username: user.username,
      email: null,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
    };
  }
}
