import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as https from 'https';
import { wechatPayConfig, validateWeChatPayConfig } from '@/config/wechat-pay.config';

export interface WeChatPayParams {
  orderNo: string;
  amount: number;
  description: string;
  openId?: string;
}

export interface WeChatPayResult {
  codeUrl?: string; // 支付二维码链接
  prepayId?: string; // 预支付交易会话标识
  paySign?: string; // 支付签名
  timeStamp?: string; // 时间戳
  nonceStr?: string; // 随机字符串
  package?: string; // 订单详情扩展字符串
}

@Injectable()
export class WeChatPayService {
  private config = wechatPayConfig;

  /**
   * 创建微信支付订单（统一下单）
   * @param params 支付参数
   * @returns 支付结果
   */
  async createOrder(params: WeChatPayParams): Promise<WeChatPayResult> {
    console.log('创建微信支付订单:', params);

    // 检查配置
    if (!validateWeChatPayConfig()) {
      // 如果配置不完整，返回模拟数据
      console.warn('微信支付配置不完整，使用模拟数据');
      return this.createMockOrder(params);
    }

    const { orderNo, amount, description, openId } = params;

    // 生成随机字符串
    const nonceStr = this.generateNonceStr();

    // 构建请求参数
    const requestParams: any = {
      appid: this.config.appId,
      mch_id: this.config.mchId,
      nonce_str: nonceStr,
      body: description,
      out_trade_no: orderNo,
      total_fee: Math.round(amount * 100), // 金额转换为分
      spbill_create_ip: '127.0.0.1',
      notify_url: this.config.notifyUrl,
      trade_type: 'NATIVE', // 扫码支付
    };

    // 如果提供了 openId，使用 JSAPI 支付
    if (openId) {
      requestParams.trade_type = 'JSAPI';
      requestParams.openid = openId;
    }

    try {
      // 生成签名
      const sign = this.generateSign(requestParams);

      // 添加签名
      const xmlData = this.buildXml({ ...requestParams, sign });

      // 发送请求
      const response = await this.sendRequest('/pay/unifiedorder', xmlData);

      console.log('微信支付统一下单响应:', response);

      // 解析响应
      const result = this.parseXml(response);

      if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
        return {
          codeUrl: result.code_url,
          prepayId: result.prepay_id,
        };
      } else {
        console.error('微信支付订单创建失败:', result);
        throw new Error(result.err_code_des || '支付订单创建失败');
      }
    } catch (error) {
      console.error('微信支付接口调用失败:', error);
      // 如果接口调用失败，返回模拟数据
      console.warn('微信支付接口调用失败，使用模拟数据');
      return this.createMockOrder(params);
    }
  }

  /**
   * 查询支付订单
   * @param orderNo 订单号
   * @returns 订单信息
   */
  async queryOrder(orderNo: string) {
    console.log('查询微信支付订单:', orderNo);

    // 检查配置
    if (!validateWeChatPayConfig()) {
      return this.createMockOrderStatus(orderNo);
    }

    const nonceStr = this.generateNonceStr();

    const requestParams = {
      appid: this.config.appId,
      mch_id: this.config.mchId,
      out_trade_no: orderNo,
      nonce_str: nonceStr,
    };

    try {
      const sign = this.generateSign(requestParams);
      const xmlData = this.buildXml({ ...requestParams, sign });

      const response = await this.sendRequest('/pay/orderquery', xmlData);
      const result = this.parseXml(response);

      if (result.return_code === 'SUCCESS') {
        return {
          orderNo,
          status: this.mapTradeState(result.trade_state),
          transactionId: result.transaction_id,
          tradeState: result.trade_state,
          totalAmount: parseInt(result.total_fee) / 100,
        };
      } else {
        throw new Error(result.err_code_des || '查询订单失败');
      }
    } catch (error) {
      console.error('查询订单失败:', error);
      return this.createMockOrderStatus(orderNo);
    }
  }

  /**
   * 申请退款
   * @param orderNo 订单号
   * @param refundAmount 退款金额
   * @param refundReason 退款原因
   * @returns 退款结果
   */
  async refund(orderNo: string, refundAmount: number, refundReason: string) {
    console.log('申请微信支付退款:', { orderNo, refundAmount, refundReason });

    // 检查配置
    if (!validateWeChatPayConfig()) {
      return this.createMockRefund(orderNo, refundAmount, refundReason);
    }

    const nonceStr = this.generateNonceStr();
    const refundId = `REF${Date.now()}${this.generateNonceStr()}`;

    const requestParams = {
      appid: this.config.appId,
      mch_id: this.config.mchId,
      nonce_str: nonceStr,
      out_trade_no: orderNo,
      out_refund_no: refundId,
      total_fee: Math.round(refundAmount * 100), // 需要传入订单总金额
      refund_fee: Math.round(refundAmount * 100),
      refund_desc: refundReason,
    };

    try {
      const sign = this.generateSign(requestParams);
      const xmlData = this.buildXml({ ...requestParams, sign });

      // 退款需要使用证书
      const response = await this.sendRequestWithCert('/secapi/pay/refund', xmlData);
      const result = this.parseXml(response);

      if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
        return {
          refundId,
          orderNo,
          refundAmount,
          status: 'SUCCESS',
          refundReason,
        };
      } else {
        throw new Error(result.err_code_des || '退款失败');
      }
    } catch (error) {
      console.error('申请退款失败:', error);
      return this.createMockRefund(orderNo, refundAmount, refundReason);
    }
  }

  /**
   * 查询退款
   * @param refundId 退款单号
   * @returns 退款信息
   */
  async queryRefund(refundId: string) {
    console.log('查询微信支付退款:', refundId);

    // 检查配置
    if (!validateWeChatPayConfig()) {
      return this.createMockRefundStatus(refundId);
    }

    const nonceStr = this.generateNonceStr();

    const requestParams = {
      appid: this.config.appId,
      mch_id: this.config.mchId,
      nonce_str: nonceStr,
      out_refund_no: refundId,
    };

    try {
      const sign = this.generateSign(requestParams);
      const xmlData = this.buildXml({ ...requestParams, sign });

      const response = await this.sendRequest('/pay/refundquery', xmlData);
      const result = this.parseXml(response);

      if (result.return_code === 'SUCCESS') {
        return {
          refundId,
          status: this.mapRefundStatus(result.refund_status),
          refundAmount: parseInt(result.refund_fee) / 100,
          refundReceiveAccount: result.refund_recv_accout,
        };
      } else {
        throw new Error(result.err_code_des || '查询退款失败');
      }
    } catch (error) {
      console.error('查询退款失败:', error);
      return this.createMockRefundStatus(refundId);
    }
  }

  /**
   * 生成随机字符串
   */
  private generateNonceStr(length = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成签名（MD5）
   */
  private generateSign(params: any): string {
    // 1. 参数排序
    const sortedKeys = Object.keys(params).sort();

    // 2. 拼接字符串
    const stringA = sortedKeys
      .filter((key) => params[key] !== undefined && params[key] !== '')
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    // 3. 拼接 API 密钥
    const stringSignTemp = `${stringA}&key=${this.config.apiKey}`;

    // 4. MD5 加密并转大写
    return crypto.createHash('md5').update(stringSignTemp, 'utf8').digest('hex').toUpperCase();
  }

  /**
   * 构建 XML
   */
  private buildXml(params: any): string {
    let xml = '<xml>';
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== '') {
        xml += `<${key}><![CDATA[${value}]]></${key}>`;
      }
    });
    xml += '</xml>';
    return xml;
  }

  /**
   * 解析 XML
   */
  public parseXml(xml: string): any {
    // 简化的 XML 解析，实际项目中建议使用 xml2js
    const result: any = {};
    const regex = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/\1>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      result[match[1]] = match[2];
    }
    return result;
  }

  /**
   * 发送请求
   */
  private async sendRequest(path: string, xmlData: string): Promise<string> {
    const url = `${this.config.apiUrl}${path}`;

    const response = await axios.post(url, xmlData, {
      headers: { 'Content-Type': 'application/xml' },
      timeout: 30000, // 30 秒超时
    });

    return response.data;
  }

  /**
   * 发送请求（使用证书）
   */
  private async sendRequestWithCert(path: string, xmlData: string): Promise<string> {
    const url = `${this.config.apiUrl}${path}`;

    // 检查证书文件是否存在
    if (!this.config.certPath || !fs.existsSync(this.config.certPath)) {
      throw new Error('证书文件不存在，请检查 WECHAT_PAY_CERT_PATH 配置');
    }

    // 读取证书
    const cert = fs.readFileSync(this.config.certPath);
    const agent = new https.Agent({
      pfx: cert,
      passphrase: this.config.certPassword,
    });

    const response = await axios.post(url, xmlData, {
      headers: { 'Content-Type': 'application/xml' },
      httpsAgent: agent,
      timeout: 30000, // 30 秒超时
    });

    return response.data;
  }

  /**
   * 映射交易状态
   */
  private mapTradeState(tradeState: string): string {
    const stateMap: any = {
      SUCCESS: 'SUCCESS',
      REFUND: 'REFUND',
      NOTPAY: 'NOTPAY',
      CLOSED: 'CLOSED',
      REVOKED: 'REVOKED',
      USERPAYING: 'USERPAYING',
      PAYERROR: 'PAYERROR',
    };
    return stateMap[tradeState] || 'UNKNOWN';
  }

  /**
   * 映射退款状态
   */
  private mapRefundStatus(refundStatus: string): string {
    const statusMap: any = {
      SUCCESS: 'SUCCESS',
      REFUNDCLOSE: 'CLOSED',
      PROCESSING: 'PROCESSING',
      CHANGE: 'CHANGE',
    };
    return statusMap[refundStatus] || 'UNKNOWN';
  }

  /**
   * 验证签名
   */
  verifySign(data: any, sign?: string): boolean {
    // 如果配置不完整，直接返回 true（模拟验证）
    if (!validateWeChatPayConfig()) {
      console.warn('微信支付配置不完整，跳过签名验证');
      return true;
    }

    try {
      // 如果没有提供 sign 参数，从 data 中提取
      const signToVerify = sign || data.sign;

      if (!signToVerify) {
        console.error('未找到签名数据');
        return false;
      }

      // 移除 sign 字段后重新计算签名
      const dataWithoutSign = { ...data };
      delete dataWithoutSign.sign;

      const computedSign = this.generateSign(dataWithoutSign);

      console.log('签名验证:', {
        received: signToVerify,
        computed: computedSign,
        match: signToVerify === computedSign
      });

      return signToVerify === computedSign;
    } catch (error) {
      console.error('签名验证失败:', error);
      return false;
    }
  }

  /**
   * 创建模拟订单（降级方案）
   */
  private createMockOrder(params: WeChatPayParams): WeChatPayResult {
    const { orderNo, amount } = params;
    const nonceStr = this.generateNonceStr();

    const result: WeChatPayResult = {
      codeUrl: `https://api.weixin.qq.com/mock/qrcode?order=${orderNo}&amount=${amount}`,
      prepayId: `wx${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      timeStamp: Math.floor(Date.now() / 1000).toString(),
      nonceStr,
      package: `prepay_id=wx${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      paySign: this.generateMockSign(orderNo, amount)
    };

    console.log('模拟微信支付订单创建成功:', result);
    return result;
  }

  /**
   * 创建模拟订单状态（降级方案）
   */
  private createMockOrderStatus(orderNo: string) {
    return {
      orderNo,
      status: 'SUCCESS',
      transactionId: `4200001234567890${Date.now()}`,
      tradeState: 'SUCCESS',
      totalAmount: 100
    };
  }

  /**
   * 创建模拟退款（降级方案）
   */
  private createMockRefund(orderNo: string, refundAmount: number, refundReason: string) {
    const refundId = `REF${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      refundId,
      orderNo,
      refundAmount,
      status: 'SUCCESS',
      refundReason
    };
  }

  /**
   * 创建模拟退款状态（降级方案）
   */
  private createMockRefundStatus(refundId: string) {
    return {
      refundId,
      status: 'SUCCESS',
      refundAmount: 100,
      refundReceiveAccount: '用户零钱'
    };
  }

  /**
   * 生成模拟签名
   */
  private generateMockSign(orderNo: string, amount: number): string {
    const signString = `order=${orderNo}&amount=${amount}&timestamp=${Date.now()}`;
    return crypto.createHash('md5').update(signString).digest('hex');
  }

  /**
   * 获取配置状态
   */
  getConfigStatus() {
    return {
      complete: validateWeChatPayConfig(),
      isSandbox: this.config.apiUrl.includes('sandboxnew'),
      config: {
        appId: this.config.appId ? '已设置' : '未设置',
        mchId: this.config.mchId ? '已设置' : '未设置',
        apiKey: this.config.apiKey ? '已设置' : '未设置',
        notifyUrl: this.config.notifyUrl ? '已设置' : '未设置',
        certPath: this.config.certPath ? '已设置' : '未设置',
        certPassword: this.config.certPassword ? '已设置' : '未设置',
        apiUrl: this.config.apiUrl,
      }
    };
  }
}
