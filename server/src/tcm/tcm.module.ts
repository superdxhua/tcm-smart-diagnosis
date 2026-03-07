import { Module } from '@nestjs/common';
import { AbuseDetectionService } from './abuse-detection.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AbuseDetectionService],
  exports: [AbuseDetectionService],
})
export class TcmModule {}
