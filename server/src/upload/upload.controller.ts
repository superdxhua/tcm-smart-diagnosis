import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Body, Get, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // 上传图片
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
  ) {
    console.log('上传图片请求:', {
      fileName: file?.originalname,
      mimeType: file?.mimetype,
      size: file?.size,
      userId,
    });

    if (!file) {
      throw new BadRequestException('请选择文件');
    }

    if (!userId) {
      throw new BadRequestException('用户ID不能为空');
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('不支持的图片格式');
    }

    try {
      const result = await this.uploadService.uploadFile({
        userId,
        fileBuffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileType: 'image',
      });

      console.log('图片上传成功:', result);

      return {
        code: 200,
        msg: '上传成功',
        data: result,
      };
    } catch (error) {
      console.error('图片上传失败:', error);
      throw new BadRequestException(error.message || '图片上传失败');
    }
  }

  // 上传文档
  @Post('document')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
  ) {
    console.log('上传文档请求:', {
      fileName: file?.originalname,
      mimeType: file?.mimetype,
      size: file?.size,
      userId,
    });

    if (!file) {
      throw new BadRequestException('请选择文件');
    }

    if (!userId) {
      throw new BadRequestException('用户ID不能为空');
    }

    // 验证文件类型
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('不支持的文档格式');
    }

    try {
      const result = await this.uploadService.uploadFile({
        userId,
        fileBuffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileType: 'document',
      });

      console.log('文档上传成功:', result);

      return {
        code: 200,
        msg: '上传成功',
        data: result,
      };
    } catch (error) {
      console.error('文档上传失败:', error);
      throw new BadRequestException(error.message || '文档上传失败');
    }
  }

  // 获取用户文件列表
  @Get('list')
  async getUserFiles(
    @Query('userId') userId: string,
    @Query('fileType') fileType?: 'image' | 'document',
  ) {
    if (!userId) {
      throw new BadRequestException('用户ID不能为空');
    }

    try {
      const files = await this.uploadService.getUserFiles(userId, fileType);

      return {
        code: 200,
        msg: 'success',
        data: files,
      };
    } catch (error) {
      console.error('获取文件列表失败:', error);
      throw new BadRequestException(error.message || '获取文件列表失败');
    }
  }

  // 获取文件记录详情
  @Get('record/:recordId')
  async getFileRecord(@Query('recordId') recordId: string) {
    if (!recordId) {
      throw new BadRequestException('记录ID不能为空');
    }

    try {
      const record = await this.uploadService.getFileRecord(recordId);

      return {
        code: 200,
        msg: 'success',
        data: record,
      };
    } catch (error) {
      console.error('获取文件记录失败:', error);
      throw new BadRequestException(error.message || '获取文件记录失败');
    }
  }
}
