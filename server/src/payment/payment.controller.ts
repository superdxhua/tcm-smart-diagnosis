import { Controller, Post, Get, Body, Query, Param, BadRequestException, Req } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { WeChatPayService } from './wechat-pay.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly weChatPayService: WeChatPayService
  ) {}

  // 创建充值订单
  @Post('create-order')
  async createOrder(
    @Body('userId') userId: string,
    @Body('amount') amount: number,
    @Body('paymentMethod') paymentMethod: 'wechat' | 'alipay',
  ) {
    console.log('创建充值订单请求:', { userId, amount, paymentMethod });

    if (!userId) {
      throw new BadRequestException('用户ID不能为空');
    }

    if (!amount || amount <= 0) {
      throw new BadRequestException('充值金额必须大于0');
    }

    if (!paymentMethod) {
      throw new BadRequestException('支付方式不能为空');
    }

    if (!['wechat', 'alipay'].includes(paymentMethod)) {
      throw new BadRequestException('不支持的支付方式');
    }

    try {
      const result = await this.paymentService.createRechargeOrder({
        userId,
        amount,
        paymentMethod,
      });

      return {
        code: 200,
        msg: '订单创建成功',
        data: result,
      };
    } catch (error) {
      console.error('创建订单失败:', error);
      throw new BadRequestException(error.message || '创建订单失败');
    }
  }

  // 创建套餐购买订单
  @Post('create-package-order')
  async createPackageOrder(
    @Body('userId') userId: string,
    @Body('packageId') packageId: string,
    @Body('paymentMethod') paymentMethod: 'wechat' | 'alipay',
  ) {
    console.log('创建套餐购买订单请求:', { userId, packageId, paymentMethod });

    if (!userId) {
      throw new BadRequestException('用户ID不能为空');
    }

    if (!packageId) {
      throw new BadRequestException('套餐ID不能为空');
    }

    if (!paymentMethod) {
      throw new BadRequestException('支付方式不能为空');
    }

    if (!['wechat', 'alipay'].includes(paymentMethod)) {
      throw new BadRequestException('不支持的支付方式');
    }

    try {
      const result = await this.paymentService.createPackageOrder({
        userId,
        packageId,
        paymentMethod,
      });

      return {
        code: 200,
        msg: '订单创建成功',
        data: result,
      };
    } catch (error) {
      console.error('创建套餐订单失败:', error);
      throw new BadRequestException(error.message || '创建套餐订单失败');
    }
  }

  // 支付回调（模拟）
  @Post('callback')
  async paymentCallback(
    @Body('orderNo') orderNo: string,
    @Body('transactionId') transactionId: string,
    @Body('status') status: 'paid' | 'failed',
  ) {
    console.log('支付回调请求:', { orderNo, transactionId, status });

    if (!orderNo) {
      throw new BadRequestException('订单号不能为空');
    }

    if (!transactionId) {
      throw new BadRequestException('交易号不能为空');
    }

    if (!status || !['paid', 'failed'].includes(status)) {
      throw new BadRequestException('支付状态无效');
    }

    try {
      await this.paymentService.handlePaymentCallback(orderNo, transactionId, status);

      return {
        code: 200,
        msg: '支付回调处理成功',
      };
    } catch (error) {
      console.error('支付回调处理失败:', error);
      throw new BadRequestException(error.message || '支付回调处理失败');
    }
  }

  // 微信支付真实回调接口
  @Post('callback/wechat')
  async wechatPaymentCallback(@Req() req: Request) {
    console.log('=== 接收到微信支付回调 ===');

    try {
      // 1. 解析 XML 数据
      let xmlData = '';
      req.on('data', (chunk) => {
        xmlData += chunk;
      });

      await new Promise((resolve, reject) => {
        req.on('end', resolve);
        req.on('error', reject);
      });

      console.log('微信支付回调 XML:', xmlData);

      // 2. 解析 XML
      const callbackData = await this.weChatPayService.parseXml(xmlData);
      console.log('解析后的回调数据:', callbackData);

      // 3. 验证签名
      const isValid = this.weChatPayService.verifySign(callbackData);
      console.log('签名验证结果:', isValid);

      if (!isValid) {
        console.error('微信支付回调签名验证失败');
        return this.buildWechatXmlResponse('FAIL', '签名验证失败');
      }

      // 4. 验证业务结果
      if (callbackData.return_code !== 'SUCCESS') {
        console.error('微信支付回调失败:', callbackData.return_msg);
        return this.buildWechatXmlResponse('FAIL', callbackData.return_msg || '支付失败');
      }

      if (callbackData.result_code !== 'SUCCESS') {
        console.error('微信支付业务失败:', callbackData.err_code, callbackData.err_code_des);
        return this.buildWechatXmlResponse('FAIL', callbackData.err_code_des || '支付失败');
      }

      // 5. 提取订单信息
      const orderNo = callbackData.out_trade_no;
      const transactionId = callbackData.transaction_id;
      const totalFee = parseInt(callbackData.total_fee) / 100; // 转换为元

      console.log('订单信息:', { orderNo, transactionId, totalFee });

      // 6. 处理支付回调
      await this.paymentService.handlePaymentCallback(orderNo, transactionId, 'paid');

      console.log('=== 微信支付回调处理成功 ===');
      return this.buildWechatXmlResponse('SUCCESS', 'OK');
    } catch (error) {
      console.error('=== 微信支付回调处理失败 ===');
      console.error('错误详情:', error);
      return this.buildWechatXmlResponse('FAIL', '处理失败');
    }
  }

  // 构建微信支付回调响应（XML 格式）
  private buildWechatXmlResponse(returnCode: string, returnMsg: string) {
    return `xml
<return_code><![CDATA[${returnCode}]]></return_code>
<return_msg><![CDATA[${returnMsg}]]></return_msg>
</xml>`;
  }

  // 获取用户余额
  @Get('balance')
  async getBalance(@Query('userId') userId: string) {
    console.log('获取用户余额请求:', userId);

    if (!userId) {
      throw new BadRequestException('用户ID不能为空');
    }

    try {
      const balance = await this.paymentService.getUserBalance(userId);

      return {
        code: 200,
        msg: 'success',
        data: balance,
      };
    } catch (error) {
      console.error('获取用户余额失败:', error);
      throw new BadRequestException(error.message || '获取用户余额失败');
    }
  }

  // 获取用户订单列表
  @Get('orders')
  async getOrders(
    @Query('userId') userId: string,
    @Query('status') status?: string,
  ) {
    console.log('获取用户订单请求:', { userId, status });

    if (!userId) {
      throw new BadRequestException('用户ID不能为空');
    }

    try {
      const orders = await this.paymentService.getUserOrders(userId, status);

      return {
        code: 200,
        msg: 'success',
        data: orders,
      };
    } catch (error) {
      console.error('获取用户订单失败:', error);
      throw new BadRequestException(error.message || '获取用户订单失败');
    }
  }

  // 查询订单状态
  @Get('order/:orderNo')
  async getOrderStatus(@Param('orderNo') orderNo: string) {
    console.log('查询订单状态请求:', orderNo);

    if (!orderNo) {
      throw new BadRequestException('订单号不能为空');
    }

    try {
      const order = await this.paymentService.getOrderByOrderNo(orderNo);

      return {
        code: 200,
        msg: 'success',
        data: order,
      };
    } catch (error) {
      console.error('查询订单状态失败:', error);
      throw new BadRequestException(error.message || '查询订单状态失败');
    }
  }

  // 获取订单统计
  @Get('orders/stats')
  async getOrderStats(@Query('userId') userId: string) {
    console.log('获取订单统计请求:', userId);

    if (!userId) {
      throw new BadRequestException('用户ID不能为空');
    }

    try {
      const stats = await this.paymentService.getOrderStats(userId);

      return {
        code: 200,
        msg: 'success',
        data: stats,
      };
    } catch (error) {
      console.error('获取订单统计失败:', error);
      throw new BadRequestException(error.message || '获取订单统计失败');
    }
  }

  // 获取套餐订单列表
  @Get('package-orders')
  async getPackageOrders(
    @Query('userId') userId: string,
    @Query('status') status?: string,
  ) {
    console.log('获取套餐订单请求:', { userId, status });

    if (!userId) {
      throw new BadRequestException('用户ID不能为空');
    }

    try {
      const orders = await this.paymentService.getPackageOrders(userId, status);

      return {
        code: 200,
        msg: 'success',
        data: orders,
      };
    } catch (error) {
      console.error('获取套餐订单失败:', error);
      throw new BadRequestException(error.message || '获取套餐订单失败');
    }
  }

  // 续费套餐
  @Post('renew-package')
  async renewPackage(
    @Body('userId') userId: string,
    @Body('packageId') packageId: string,
    @Body('paymentMethod') paymentMethod: 'wechat' | 'alipay',
  ) {
    console.log('续费套餐请求:', { userId, packageId, paymentMethod });

    if (!userId) {
      throw new BadRequestException('用户ID不能为空');
    }

    if (!packageId) {
      throw new BadRequestException('套餐ID不能为空');
    }

    if (!paymentMethod) {
      throw new BadRequestException('支付方式不能为空');
    }

    try {
      const result = await this.paymentService.renewPackage({
        userId,
        packageId,
        paymentMethod,
      });

      return {
        code: 200,
        msg: '续费订单创建成功',
        data: result,
      };
    } catch (error) {
      console.error('续费套餐失败:', error);
      throw new BadRequestException(error.message || '续费套餐失败');
    }
  }

  // 申请退款
  @Post('refund')
  async refundOrder(
    @Body('orderNo') orderNo: string,
    @Body('refundAmount') refundAmount: number,
    @Body('refundReason') refundReason?: string,
  ) {
    console.log('申请退款请求:', { orderNo, refundAmount, refundReason });

    if (!orderNo) {
      throw new BadRequestException('订单号不能为空');
    }

    if (!refundAmount || refundAmount <= 0) {
      throw new BadRequestException('退款金额必须大于0');
    }

    try {
      const result = await this.paymentService.refundOrder({
        orderNo,
        refundAmount,
        refundReason: refundReason || '用户申请退款'
      });

      return {
        code: 200,
        msg: '退款申请成功',
        data: result,
      };
    } catch (error) {
      console.error('申请退款失败:', error);
      throw new BadRequestException(error.message || '申请退款失败');
    }
  }

  // 查询退款
  @Get('refund/:refundId')
  async queryRefund(@Param('refundId') refundId: string) {
    console.log('查询退款请求:', refundId);

    if (!refundId) {
      throw new BadRequestException('退款单号不能为空');
    }

    try {
      const result = await this.paymentService.queryRefund(refundId);

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('查询退款失败:', error);
      throw new BadRequestException(error.message || '查询退款失败');
    }
  }

  // 获取微信支付配置状态
  @Get('config/wechat')
  async getWeChatPayConfigStatus() {
    try {
      const status = this.weChatPayService.getConfigStatus();

      return {
        code: 200,
        msg: 'success',
        data: status,
      };
    } catch (error) {
      console.error('获取微信支付配置状态失败:', error);
      throw new BadRequestException(error.message || '获取微信支付配置状态失败');
    }
  }

  // ============ 手动充值功能（商户收款码） ============

  // 获取商户收款码配置
  @Get('merchant-qrcodes')
  async getMerchantQrCodes() {
    try {
      const result = await this.paymentService.getMerchantQrCodes();

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('获取商户收款码配置失败:', error);
      throw new BadRequestException(error.message || '获取商户收款码配置失败');
    }
  }

  // 创建手动充值订单（扫码转账）
  @Post('manual-recharge/create')
  async createManualRechargeOrder(
    @Body('userId') userId: string,
    @Body('amount') amount: number,
    @Body('paymentMethod') paymentMethod: 'wechat' | 'alipay',
  ) {
    console.log('创建手动充值订单请求:', { userId, amount, paymentMethod });

    if (!userId) {
      throw new BadRequestException('用户ID不能为空');
    }

    if (!amount || amount <= 0) {
      throw new BadRequestException('充值金额必须大于0');
    }

    if (!paymentMethod || !['wechat', 'alipay'].includes(paymentMethod)) {
      throw new BadRequestException('支付方式无效');
    }

    try {
      const result = await this.paymentService.createManualRechargeOrder({
        userId,
        amount,
        paymentMethod,
      });

      return {
        code: 200,
        msg: '订单创建成功，请扫描二维码转账',
        data: result,
      };
    } catch (error) {
      console.error('创建手动充值订单失败:', error);
      throw new BadRequestException(error.message || '创建手动充值订单失败');
    }
  }

  // 上传充值截图
  @Post('manual-recharge/upload-screenshot')
  async uploadRechargeScreenshot(
    @Body('userId') userId: string,
    @Body('orderNo') orderNo: string,
    @Body('screenshotUrl') screenshotUrl: string,
  ) {
    console.log('上传充值截图请求:', { userId, orderNo, screenshotUrl });

    if (!userId) {
      throw new BadRequestException('用户ID不能为空');
    }

    if (!orderNo) {
      throw new BadRequestException('订单号不能为空');
    }

    if (!screenshotUrl) {
      throw new BadRequestException('截图URL不能为空');
    }

    try {
      const result = await this.paymentService.uploadRechargeScreenshot({
        userId,
        orderNo,
        screenshotUrl,
      });

      return {
        code: 200,
        msg: '截图上传成功',
        data: result,
      };
    } catch (error) {
      console.error('上传充值截图失败:', error);
      throw new BadRequestException(error.message || '上传充值截图失败');
    }
  }

  // 提交充值审核
  @Post('manual-recharge/submit-audit')
  async submitRechargeForAudit(
    @Body('userId') userId: string,
    @Body('orderNo') orderNo: string,
  ) {
    console.log('提交充值审核请求:', { userId, orderNo });

    if (!userId) {
      throw new BadRequestException('用户ID不能为空');
    }

    if (!orderNo) {
      throw new BadRequestException('订单号不能为空');
    }

    try {
      const result = await this.paymentService.submitRechargeForAudit({
        userId,
        orderNo,
      });

      return {
        code: 200,
        msg: '审核已提交',
        data: result,
      };
    } catch (error) {
      console.error('提交充值审核失败:', error);
      throw new BadRequestException(error.message || '提交充值审核失败');
    }
  }

  // 获取用户充值订单列表
  @Get('manual-recharge/orders')
  async getUserRechargeOrders(@Query('userId') userId: string) {
    console.log('获取用户充值订单请求:', { userId });

    if (!userId) {
      throw new BadRequestException('用户ID不能为空');
    }

    try {
      const orders = await this.paymentService.getUserRechargeOrders(userId);

      return {
        code: 200,
        msg: 'success',
        data: orders,
      };
    } catch (error) {
      console.error('获取用户充值订单失败:', error);
      throw new BadRequestException(error.message || '获取用户充值订单失败');
    }
  }

  // ============ 管理员接口 ============

  // 获取待审核充值订单列表（管理员）
  @Get('admin/pending-audits')
  async getPendingAuditOrders(@Query('limit') limit?: number) {
    try {
      const orders = await this.paymentService.getPendingAuditOrders(
        limit ? parseInt(limit.toString()) : 20
      );

      return {
        code: 200,
        msg: 'success',
        data: orders,
      };
    } catch (error) {
      console.error('获取待审核订单失败:', error);
      throw new BadRequestException(error.message || '获取待审核订单失败');
    }
  }

  // 审核充值订单（管理员）
  @Post('admin/audit')
  async auditRechargeOrder(
    @Body('adminId') adminId: string,
    @Body('orderNo') orderNo: string,
    @Body('approved') approved: boolean,
    @Body('remark') remark?: string,
  ) {
    console.log('审核充值订单请求:', { adminId, orderNo, approved, remark });

    if (!adminId) {
      throw new BadRequestException('管理员ID不能为空');
    }

    if (!orderNo) {
      throw new BadRequestException('订单号不能为空');
    }

    if (typeof approved !== 'boolean') {
      throw new BadRequestException('审核结果无效');
    }

    try {
      const result = await this.paymentService.auditRechargeOrder({
        adminId,
        orderNo,
        approved,
        remark,
      });

      return {
        code: 200,
        msg: '审核成功',
        data: result,
      };
    } catch (error) {
      console.error('审核充值订单失败:', error);
      throw new BadRequestException(error.message || '审核充值订单失败');
    }
  }
}
