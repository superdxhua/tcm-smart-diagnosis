import { Module } from '@nestjs/common';
import { TcmController } from './tcm.controller';
import { TcmService } from './tcm.service';
import { AbuseDetectionService } from './abuse-detection.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TcmController],
  providers: [TcmService, AbuseDetectionService],
  exports: [TcmService, AbuseDetectionService],
})
export class TcmModule {}
