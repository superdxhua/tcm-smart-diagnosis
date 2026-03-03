import { Injectable, BadRequestException } from '@nestjs/common';

export interface UploadFileParams {
  userId: string;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  fileType: 'image' | 'document';
}

export interface UploadFileResult {
  fileKey: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  recordId: string;
}

export interface CreateOrderParams {
  userId: string;
  amount: number;
  paymentMethod: 'wechat' | 'alipay';
}

export interface CreateOrderResult {
  orderId: string;
  orderNo: string;
  amount: number;
  paymentMethod: string;
  qrCode?: string;
  paymentUrl?: string;
  packageId?: string;
  packageName?: string;
  duration?: number;
  expiresAt?: string;
  prepayId?: string;
  paySign?: string;
  timeStamp?: string;
  nonceStr?: string;
  package?: string;
}
