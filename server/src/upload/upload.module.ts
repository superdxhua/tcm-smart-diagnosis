import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';

@Module({
  imports: [],
  controllers: [],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
