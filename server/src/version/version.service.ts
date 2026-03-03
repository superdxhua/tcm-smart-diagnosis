import { Injectable, NotFoundException } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class VersionService {
  // 创建版本
  async createVersion(versionData: any) {
    const supabase = getSupabaseClient();

    const newVersion = {
      ...versionData,
      release_date: versionData.releaseDate || new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('app_versions')
      .insert(newVersion)
      .select()
      .single();

    if (error) {
      throw new NotFoundException(error.message);
    }

    return data;
  }

  // 获取最新版本
  async getLatestVersion(platform: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('app_versions')
      .select('*')
      .eq('platform', platform)
      .eq('is_active', true)
      .order('version_code', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      throw new NotFoundException('未找到版本信息');
    }

    return data;
  }

  // 检查更新
  async checkUpdate(currentVersionCode: number, platform: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('app_versions')
      .select('*')
      .eq('platform', platform)
      .eq('is_active', true)
      .order('version_code', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return {
        hasUpdate: false,
        currentVersionCode,
        latestVersionCode: 0,
        message: '未找到版本信息',
      };
    }

    const hasUpdate = data.version_code > currentVersionCode;

    return {
      hasUpdate,
      currentVersionCode,
      latestVersionCode: data.version_code,
      latestVersion: data.version,
      isForced: data.is_forced,
      changeLog: data.change_log,
      downloadUrl: data.download_url,
      fileSize: data.file_size,
      releaseDate: data.release_date,
    };
  }

  // 获取所有版本
  async getAllVersions(platform?: string) {
    const supabase = getSupabaseClient();

    let query = supabase
      .from('app_versions')
      .select('*')
      .order('version_code', { ascending: false });

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data, error } = await query;

    if (error) {
      throw new NotFoundException(error.message);
    }

    return data || [];
  }

  // 更新版本状态
  async updateVersionStatus(versionId: string, isActive: boolean) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('app_versions')
      .update({ is_active: isActive })
      .eq('id', versionId)
      .select()
      .single();

    if (error) {
      throw new NotFoundException(error.message);
    }

    return data;
  }

  // 删除版本
  async deleteVersion(versionId: string) {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('app_versions')
      .delete()
      .eq('id', versionId);

    if (error) {
      throw new NotFoundException(error.message);
    }

    return { message: '版本删除成功' };
  }
}
