import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { WeChatPayService } from './wechat-pay.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, WeChatPayService],
  exports: [PaymentService, WeChatPayService],
})
export class PaymentModule {}
