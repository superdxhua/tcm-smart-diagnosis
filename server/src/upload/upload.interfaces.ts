// 上传接口类型定义

export interface CreateOrderParams {
  userId: string;
  amount: number;
  paymentMethod: 'wechat' | 'alipay';
  packageId?: string;
  currency?: string;
  description?: string;
}

export interface CreateOrderResult {
  orderId: string;
  orderNo?: string;
  paymentUrl?: string;
  qrCode?: string;
  prepayId?: string;
  paySign?: string;
  timeStamp?: string;
  nonceStr?: string;
  package?: string;
  amount?: number;
  paymentMethod?: 'wechat' | 'alipay';
  packageId?: string;
  packageName?: string;
  duration?: any;
  expiresAt?: string;
}
