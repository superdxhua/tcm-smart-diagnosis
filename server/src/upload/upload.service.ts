import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Storage } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { v4 as uuidv4 } from 'uuid';
import { UploadFileParams, UploadFileResult } from './upload.interfaces';

@Injectable()
export class UploadService {
  private storage: S3Storage;
  private supabase = getSupabaseClient();

  constructor() {
    this.storage = new S3Storage({
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });
  }

  async uploadFile(params: UploadFileParams): Promise<UploadFileResult> {
    const { userId, fileBuffer, fileName, mimeType, fileType } = params;

    console.log('开始上传文件:', {
      userId,
      fileName,
      mimeType,
      fileType,
      fileSize: fileBuffer.length,
    });

    try {
      // 上传文件到对象存储
      const fileKey = await this.storage.uploadFile({
        fileContent: fileBuffer,
        fileName: `uploads/${fileType}/${userId}_${Date.now()}_${fileName}`,
        contentType: mimeType,
      });

      console.log('文件上传成功，fileKey:', fileKey);

      // 生成签名 URL
      const fileUrl = await this.storage.generatePresignedUrl({
        key: fileKey,
        expireTime: 86400, // 1 天有效期
      });

      console.log('文件 URL 生成成功:', fileUrl);

      // 插入文件记录到数据库
      const recordId = uuidv4();
      const { error: insertError } = await this.supabase
        .from('file_records')
        .insert({
          id: recordId,
          user_id: userId,
          file_name: fileName,
          file_key: fileKey,
          file_type: fileType,
          file_size: fileBuffer.length,
          mime_type: mimeType,
          file_url: fileUrl,
          is_processed: false,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('文件记录插入失败:', insertError);
        throw new BadRequestException('文件记录插入失败: ' + insertError.message);
      }

      console.log('文件记录插入成功，recordId:', recordId);

      return {
        fileKey,
        fileUrl,
        fileName,
        fileSize: fileBuffer.length,
        fileType,
        recordId,
      };
    } catch (error) {
      console.error('文件上传失败:', error);
      throw new BadRequestException('文件上传失败: ' + error.message);
    }
  }

  async getFileRecord(recordId: string) {
    const { data: record, error } = await this.supabase
      .from('file_records')
      .select('*')
      .eq('id', recordId)
      .single();

    if (error || !record) {
      throw new BadRequestException('文件记录不存在');
    }

    return record;
  }

  async updateFileProcessingResult(
    recordId: string,
    processingResult: string,
  ) {
    const { error } = await this.supabase
      .from('file_records')
      .update({
        processing_result: processingResult,
        is_processed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', recordId);

    if (error) {
      console.error('更新文件处理结果失败:', error);
      throw new BadRequestException('更新文件处理结果失败: ' + error.message);
    }
  }

  async getUserFiles(userId: string, fileType?: 'image' | 'document') {
    let query = this.supabase
      .from('file_records')
      .select('*')
      .eq('user_id', userId);

    if (fileType) {
      query = query.eq('file_type', fileType);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('获取用户文件列表失败:', error);
      throw new BadRequestException('获取用户文件列表失败: ' + error.message);
    }

    return data || [];
  }
}
