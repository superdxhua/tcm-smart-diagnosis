import { Injectable, BadRequestException } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderParams, CreateOrderResult } from '../upload/upload.interfaces';
import { WeChatPayService } from './wechat-pay.service';

@Injectable()
export class PaymentService {
  private supabase = getSupabaseClient();
  constructor(private readonly weChatPayService: WeChatPayService) {}

  // 创建套餐购买订单
  async createPackageOrder(params: {
    userId: string;
    packageId: string;
    paymentMethod: 'wechat' | 'alipay';
  }): Promise<CreateOrderResult> {
    const { userId, packageId, paymentMethod } = params;

    console.log('创建套餐购买订单:', { userId, packageId, paymentMethod });

    // 获取套餐信息
    const { data: package_, error: packageError } = await this.supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single();

    if (packageError || !package_) {
      throw new BadRequestException('套餐不存在或已下架');
    }

    // 生成订单号
    const orderNo = `PKG${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 计算到期时间
    const now = new Date();
    const expiresAt = new Date(now.getTime() + package_.duration * 24 * 60 * 60 * 1000);

    // 创建订单记录
    const orderId = uuidv4();
    const { error: insertError } = await this.supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: userId,
        order_no: orderNo,
        package_id: packageId,
        amount: package_.price,
        payment_method: paymentMethod,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      });

    if (insertError) {
      console.error('订单创建失败:', insertError);
      throw new BadRequestException('订单创建失败: ' + insertError.message);
    }

    console.log('套餐订单创建成功:', { orderId, orderNo, packageId });

    // 生成支付二维码或支付链接
    const paymentData = await this.generatePaymentData(orderNo, parseFloat(package_.price), paymentMethod, package_.name);

    return {
      orderId,
      orderNo,
      amount: parseFloat(package_.price),
      paymentMethod,
      packageId,
      packageName: package_.name,
      duration: package_.duration,
      expiresAt: expiresAt.toISOString(),
      ...paymentData,
    };
  }

  // 创建充值订单
  async createRechargeOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    const { userId, amount, paymentMethod } = params;

    console.log('创建充值订单:', { userId, amount, paymentMethod });

    // 验证金额
    if (amount <= 0) {
      throw new BadRequestException('充值金额必须大于0');
    }

    if (amount > 100000) {
      throw new BadRequestException('单笔充值金额不能超过100000元');
    }

    // 生成订单号
    const orderNo = `RCG${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 创建订单记录
    const orderId = uuidv4();
    const { error: insertError } = await this.supabase
      .from('recharge_orders')
      .insert({
        id: orderId,
        user_id: userId,
        order_no: orderNo,
        amount: amount.toString(),
        payment_method: paymentMethod,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('订单创建失败:', insertError);
      throw new BadRequestException('订单创建失败: ' + insertError.message);
    }

    console.log('订单创建成功:', { orderId, orderNo });

    // 生成支付二维码或支付链接
    const paymentData = await this.generatePaymentData(orderNo, amount, paymentMethod, '充值订单');

    return {
      orderId,
      orderNo,
      amount,
      paymentMethod,
      ...paymentData,
    };
  }

  // 生成支付数据
  private async generatePaymentData(orderNo: string, amount: number, paymentMethod: string, description: string = '订单支付') {
    // 使用真实支付服务生成支付数据
    if (paymentMethod === 'wechat') {
      try {
        const result = await this.weChatPayService.createOrder({
          orderNo,
          amount,
          description
        });

        return {
          qrCode: result.codeUrl,
          paymentUrl: `weixin://pay?prepayId=${result.prepayId}`,
          prepayId: result.prepayId,
          paySign: result.paySign,
          timeStamp: result.timeStamp,
          nonceStr: result.nonceStr,
          package: result.package
        };
      } catch (error) {
        console.error('微信支付创建失败，使用模拟数据:', error);
        // 降级到模拟数据
        return {
          qrCode: `https://api.weixin.qq.com/mock/qrcode?order=${orderNo}&amount=${amount}`,
          paymentUrl: `weixin://pay?order=${orderNo}&amount=${amount}`,
        };
      }
    } else if (paymentMethod === 'alipay') {
      // 支付宝支付（模拟）
      return {
        qrCode: `https://api.alipay.com/mock/qrcode?order=${orderNo}&amount=${amount}`,
        paymentUrl: `alipay://pay?order=${orderNo}&amount=${amount}`,
      };
    }

    return {};
  }

  // 模拟支付回调
  async handlePaymentCallback(orderNo: string, transactionId: string, status: 'paid' | 'failed') {
    console.log('支付回调:', { orderNo, transactionId, status });

    // 先查找套餐订单
    const { data: packageOrder, error: packageError } = await this.supabase
      .from('orders')
      .select('*')
      .eq('order_no', orderNo)
      .single();

    if (!packageError && packageOrder) {
      return this.handlePackageOrderCallback(packageOrder, transactionId, status);
    }

    // 再查找充值订单
    const { data: rechargeOrder, error: rechargeError } = await this.supabase
      .from('recharge_orders')
      .select('*')
      .eq('order_no', orderNo)
      .single();

    if (!rechargeError && rechargeOrder) {
      return this.handleRechargeOrderCallback(rechargeOrder, transactionId, status);
    }

    throw new BadRequestException('订单不存在');
  }

  // 处理套餐订单支付回调
  private async handlePackageOrderCallback(
    order: any,
    transactionId: string,
    status: 'paid' | 'failed'
  ) {
    console.log('处理套餐订单回调:', order.order_no);

    // 检查订单状态
    if (order.status !== 'pending') {
      throw new BadRequestException('订单已处理');
    }

    // 更新订单状态
    const { error: updateError } = await this.supabase
      .from('orders')
      .update({
        status,
        transaction_id: transactionId,
        paid_at: status === 'paid' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('order_no', order.order_no);

    if (updateError) {
      console.error('订单状态更新失败:', updateError);
      throw new BadRequestException('订单状态更新失败: ' + updateError.message);
    }

    // 如果支付成功，更新用户权限
    if (status === 'paid') {
      await this.updateUserPermissions(order.user_id, order.expires_at);
    }

    console.log('套餐订单状态更新成功:', { orderNo: order.order_no, status });
  }

  // 处理充值订单支付回调
  private async handleRechargeOrderCallback(
    order: any,
    transactionId: string,
    status: 'paid' | 'failed'
  ) {
    console.log('处理充值订单回调:', order.order_no);

    // 检查订单状态
    if (order.status !== 'pending') {
      throw new BadRequestException('订单已处理');
    }

    // 更新订单状态
    const { error: updateError } = await this.supabase
      .from('recharge_orders')
      .update({
        status,
        transaction_id: transactionId,
        paid_at: status === 'paid' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('order_no', order.order_no);

    if (updateError) {
      console.error('订单状态更新失败:', updateError);
      throw new BadRequestException('订单状态更新失败: ' + updateError.message);
    }

    // 如果支付成功，更新用户余额
    if (status === 'paid') {
      await this.updateUserBalance(order.user_id, order.amount);
    }

    console.log('充值订单状态更新成功:', { orderNo: order.order_no, status });
  }

  // 更新用户权限（套餐购买后）
  private async updateUserPermissions(userId: string, expiresAt: string) {
    console.log('更新用户权限:', { userId, expiresAt });

    // 查找用户权限记录
    const { data: permissions } = await this.supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', userId)
      .single();

    const now = new Date();
    const expiresAtDate = new Date(expiresAt);

    if (permissions) {
      // 如果已有权限，比较到期时间，选择更晚的
      const currentExpiresAt = new Date(permissions.expires_at);

      if (expiresAtDate > currentExpiresAt) {
        const { error: updateError } = await this.supabase
          .from('user_permissions')
          .update({
            expires_at: expiresAt,
            updated_at: now.toISOString(),
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('用户权限更新失败:', updateError);
          throw new BadRequestException('用户权限更新失败: ' + updateError.message);
        }
      }
    } else {
      // 创建权限记录
      const { error: insertError } = await this.supabase
        .from('user_permissions')
        .insert({
          id: uuidv4(),
          user_id: userId,
          expires_at: expiresAt,
          role: 'user',
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        });

      if (insertError) {
        console.error('用户权限创建失败:', insertError);
        throw new BadRequestException('用户权限创建失败: ' + insertError.message);
      }
    }

    console.log('用户权限更新成功');
  }


  // 根据订单号查询订单
  async getOrderByOrderNo(orderNo: string) {
    console.log('查询订单:', orderNo);

    // 先在 orders 表中查询
    const { data: order } = await this.supabase
      .from('orders')
      .select('*')
      .eq('order_no', orderNo)
      .single();

    if (order) {
      // 获取套餐信息
      if (order.package_id) {
        const { data: package_ } = await this.supabase
          .from('packages')
          .select('name, duration, description')
          .eq('id', order.package_id)
          .single();

        if (package_) {
          return {
            ...order,
            package: package_
          };
        }
      }
      return order;
    }

    // 如果在 orders 表中没找到，再在 recharge_orders 表中查询
    const { data: rechargeOrder } = await this.supabase
      .from('recharge_orders')
      .select('*')
      .eq('order_no', orderNo)
      .single();

    if (rechargeOrder) {
      return {
        ...rechargeOrder,
        type: 'recharge'
      };
    }

    throw new BadRequestException('订单不存在');
  }

  // 获取订单统计
  async getOrderStats(userId: string) {
    console.log('获取订单统计:', userId);

    // 查询套餐订单统计
    const { data: packageOrders } = await this.supabase
      .from('orders')
      .select('status, amount')
      .eq('user_id', userId);

    // 查询充值订单统计
    const { data: rechargeOrders } = await this.supabase
      .from('recharge_orders')
      .select('status, amount')
      .eq('user_id', userId);

    // 合并所有订单
    const allOrders = [
      ...(packageOrders || []).map(o => ({ ...o, type: 'package' })),
      ...(rechargeOrders || []).map(o => ({ ...o, type: 'recharge' }))
    ];

    // 统计数据
    const stats = {
      total: allOrders.length,
      pending: 0,
      paid: 0,
      failed: 0,
      totalAmount: 0,
      paidAmount: 0
    };

    allOrders.forEach(order => {
      const amount = parseFloat(order.amount || '0');
      stats.totalAmount += amount;

      if (order.status === 'pending') {
        stats.pending++;
      } else if (order.status === 'paid') {
        stats.paid++;
        stats.paidAmount += amount;
      } else if (order.status === 'failed') {
        stats.failed++;
      }
    });

    return stats;
  }

  // 获取套餐订单列表
  async getPackageOrders(userId: string, status?: string) {
    console.log('获取套餐订单:', { userId, status });

    let query = this.supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('获取套餐订单失败:', error);
      throw new BadRequestException('获取套餐订单失败: ' + error.message);
    }

    // 获取套餐信息
    const ordersWithPackage = await Promise.all(
      (orders || []).map(async (order) => {
        if (order.package_id) {
          const { data: package_ } = await this.supabase
            .from('packages')
            .select('name, duration, description')
            .eq('id', order.package_id)
            .single();

          return {
            ...order,
            package: package_
          };
        }
        return order;
      })
    );

    return ordersWithPackage || [];
  }

  // 续费套餐
  async renewPackage(params: {
    userId: string;
    packageId: string;
    paymentMethod: 'wechat' | 'alipay';
  }) {
    const { userId, packageId, paymentMethod } = params;

    console.log('续费套餐:', params);

    // 获取套餐信息
    const { data: package_, error: packageError } = await this.supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single();

    if (packageError || !package_) {
      throw new BadRequestException('套餐不存在或已下架');
    }

    // 查询用户当前权限
    const { data: permissions } = await this.supabase
      .from('user_permissions')
      .select('expires_at')
      .eq('user_id', userId)
      .single();

    // 计算新的到期时间
    const now = new Date();
    const baseDate = permissions && new Date(permissions.expires_at) > now
      ? new Date(permissions.expires_at)
      : now;

    const newExpiresAt = new Date(baseDate.getTime() + package_.duration * 24 * 60 * 60 * 1000);

    // 生成订单号
    const orderNo = `RENEW${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 创建续费订单
    const orderId = uuidv4();
    const { error: insertError } = await this.supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: userId,
        order_no: orderNo,
        package_id: packageId,
        amount: package_.price,
        payment_method: paymentMethod,
        status: 'pending',
        expires_at: newExpiresAt.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      });

    if (insertError) {
      console.error('续费订单创建失败:', insertError);
      throw new BadRequestException('续费订单创建失败: ' + insertError.message);
    }

    console.log('续费订单创建成功:', { orderId, orderNo });

    // 生成支付数据
    const paymentData = this.generatePaymentData(orderNo, parseFloat(package_.price), paymentMethod);

    return {
      orderId,
      orderNo,
      amount: parseFloat(package_.price),
      paymentMethod,
      packageId,
      packageName: package_.name,
      duration: package_.duration,
      oldExpiresAt: baseDate.toISOString(),
      newExpiresAt: newExpiresAt.toISOString(),
      ...paymentData,
    };
  }

  // 更新用户余额
  private async updateUserBalance(userId: string, amount: string) {
    console.log('更新用户余额:', { userId, amount });

    const amountNum = parseFloat(amount);

    // 查找用户余额记录
    const { data: balances } = await this.supabase
      .from('user_balance')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!balances) {
      // 创建余额记录
      const { error: insertError } = await this.supabase
        .from('user_balance')
        .insert({
          id: uuidv4(),
          user_id: userId,
          balance: amount,
          total_recharge: amount,
          total_consumed: '0.00',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('余额记录创建失败:', insertError);
        throw new BadRequestException('余额记录创建失败: ' + insertError.message);
      }
    } else {
      const balance = balances;
      const currentBalance = parseFloat(balance.balance || '0');
      const totalRecharge = parseFloat(balance.total_recharge || '0');

      // 更新余额记录
      const { error: updateError } = await this.supabase
        .from('user_balance')
        .update({
          balance: (currentBalance + amountNum).toString(),
          total_recharge: (totalRecharge + amountNum).toString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('余额更新失败:', updateError);
        throw new BadRequestException('余额更新失败: ' + updateError.message);
      }
    }

    console.log('用户余额更新成功');
  }

  // 获取用户余额
  async getUserBalance(userId: string) {
    console.log('获取用户余额:', userId);

    const { data: balance } = await this.supabase
      .from('user_balance')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!balance) {
      return {
        userId,
        balance: '0.00',
        totalRecharge: '0.00',
        totalConsumed: '0.00',
      };
    }

    return balance;
  }

  // 获取用户订单列表
  async getUserOrders(userId: string, status?: string) {
    console.log('获取用户订单:', { userId, status });

    let query = this.supabase
      .from('recharge_orders')
      .select('*')
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('获取用户订单失败:', error);
      throw new BadRequestException('获取用户订单失败: ' + error.message);
    }

    return data || [];
  }

  // 申请退款
  async refundOrder(params: {
    orderNo: string;
    refundAmount: number;
    refundReason?: string;
  }) {
    const { orderNo, refundAmount, refundReason } = params;

    console.log('申请退款:', params);

    // 查询订单
    const order = await this.getOrderByOrderNo(orderNo);

    // 检查订单状态
    if (order.status !== 'paid') {
      throw new BadRequestException('只有已支付的订单才能退款');
    }

    // 检查退款金额
    const orderAmount = parseFloat(order.amount || '0');
    if (refundAmount > orderAmount) {
      throw new BadRequestException('退款金额不能超过订单金额');
    }

    // 调用微信支付退款
    const refundResult = await this.weChatPayService.refund(orderNo, refundAmount, refundReason || '用户申请退款');

    // 创建退款记录
    const { error: insertError } = await this.supabase
      .from('refunds')
      .insert({
        id: uuidv4(),
        order_no: orderNo,
        refund_id: refundResult.refundId,
        refund_amount: refundAmount,
        refund_reason: refundReason,
        status: refundResult.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('退款记录创建失败:', insertError);
      console.warn('退款记录创建失败，但退款已处理');
    }

    console.log('退款申请成功:', refundResult);
    return refundResult;
  }

  // 查询退款
  async queryRefund(refundId: string) {
    console.log('查询退款:', refundId);

    // 查询退款记录
    const { data: refund } = await this.supabase
      .from('refunds')
      .select('*')
      .eq('refund_id', refundId)
      .single();

    if (!refund) {
      throw new BadRequestException('退款记录不存在');
    }

    // 如果退款状态不是最终状态，查询支付平台
    if (refund.status === 'PROCESSING') {
      const platformRefund = await this.weChatPayService.queryRefund(refundId);

      // 更新退款状态
      if (platformRefund.status !== refund.status) {
        await this.supabase
          .from('refunds')
          .update({
            status: platformRefund.status,
            updated_at: new Date().toISOString()
          })
          .eq('refund_id', refundId);

        return platformRefund;
      }
    }

    return refund;
  }

  // ============ 手动充值功能（商户收款码） ============

  // 创建手动充值订单（扫码转账）
  async createManualRechargeOrder(params: {
    userId: string;
    amount: number;
    paymentMethod: 'wechat' | 'alipay';
  }) {
    const { userId, amount, paymentMethod } = params;

    console.log('创建手动充值订单:', { userId, amount, paymentMethod });

    // 验证金额
    if (amount <= 0) {
      throw new BadRequestException('充值金额必须大于0');
    }

    if (amount > 100000) {
      throw new BadRequestException('单笔充值金额不能超过100000元');
    }

    // 生成订单号
    const orderNo = `MNL${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 创建订单记录（状态为 pending，等待审核）
    const orderId = uuidv4();
    const { error: insertError } = await this.supabase
      .from('recharge_orders')
      .insert({
        id: orderId,
        user_id: userId,
        order_no: orderNo,
        amount: amount.toString(),
        payment_method: paymentMethod,
        status: 'pending',
        audit_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('订单创建失败:', insertError);
      throw new BadRequestException('订单创建失败: ' + insertError.message);
    }

    console.log('手动充值订单创建成功:', { orderId, orderNo });

    return {
      orderId,
      orderNo,
      amount,
      paymentMethod,
      status: 'pending',
      auditStatus: 'pending',
    };
  }

  // 上传充值截图
  async uploadRechargeScreenshot(params: {
    userId: string;
    orderNo: string;
    screenshotUrl: string;
  }) {
    const { userId, orderNo, screenshotUrl } = params;

    console.log('上传充值截图:', { userId, orderNo, screenshotUrl });

    // 验证订单归属
    const { data: order, error: orderError } = await this.supabase
      .from('recharge_orders')
      .select('*')
      .eq('order_no', orderNo)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      throw new BadRequestException('订单不存在或无权操作');
    }

    // 检查订单状态
    if (order.audit_status !== 'pending') {
      throw new BadRequestException('订单已审核，无法再次上传截图');
    }

    // 更新截图URL
    const { error: updateError } = await this.supabase
      .from('recharge_orders')
      .update({
        screenshot_url: screenshotUrl,
        audit_status: 'submitted', // 状态改为已提交，等待审核
        updated_at: new Date().toISOString(),
      })
      .eq('order_no', orderNo);

    if (updateError) {
      console.error('截图上传失败:', updateError);
      throw new BadRequestException('截图上传失败: ' + updateError.message);
    }

    console.log('截图上传成功:', { orderNo, screenshotUrl });

    return {
      orderNo,
      screenshotUrl,
      auditStatus: 'submitted',
      message: '截图上传成功，等待管理员审核',
    };
  }

  // 提交充值审核
  async submitRechargeForAudit(params: {
    userId: string;
    orderNo: string;
  }) {
    const { userId, orderNo } = params;

    console.log('提交充值审核:', { userId, orderNo });

    // 验证订单归属
    const { data: order, error: orderError } = await this.supabase
      .from('recharge_orders')
      .select('*')
      .eq('order_no', orderNo)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      throw new BadRequestException('订单不存在或无权操作');
    }

    // 检查是否已上传截图
    if (!order.screenshot_url) {
      throw new BadRequestException('请先上传转账截图');
    }

    // 检查审核状态
    if (order.audit_status !== 'submitted') {
      throw new BadRequestException('订单已提交审核，无需重复提交');
    }

    console.log('充值审核提交成功:', { orderNo });

    return {
      orderNo,
      auditStatus: 'submitted',
      message: '审核已提交，请耐心等待管理员审核',
    };
  }

  // 审核充值订单（管理员）
  async auditRechargeOrder(params: {
    adminId: string;
    orderNo: string;
    approved: boolean;
    remark?: string;
  }) {
    const { adminId, orderNo, approved, remark } = params;

    console.log('审核充值订单:', { adminId, orderNo, approved, remark });

    // 查询订单
    const { data: order, error: orderError } = await this.supabase
      .from('recharge_orders')
      .select('*')
      .eq('order_no', orderNo)
      .single();

    if (orderError || !order) {
      throw new BadRequestException('订单不存在');
    }

    // 检查审核状态
    if (order.audit_status === 'approved' || order.audit_status === 'rejected') {
      throw new BadRequestException('订单已审核，无法重复操作');
    }

    // 更新审核状态
    const auditStatus = approved ? 'approved' : 'rejected';
    const { error: updateError } = await this.supabase
      .from('recharge_orders')
      .update({
        audit_status: auditStatus,
        audit_remark: remark || '',
        audited_by: adminId,
        audited_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('order_no', orderNo);

    if (updateError) {
      console.error('审核失败:', updateError);
      throw new BadRequestException('审核失败: ' + updateError.message);
    }

    // 如果审核通过，执行充值操作
    if (approved) {
      // 更新订单状态为已支付
      await this.supabase
        .from('recharge_orders')
        .update({
          status: 'paid',
          transaction_id: `MANUAL_${Date.now()}`,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('order_no', orderNo);

      // 更新用户余额
      await this.updateUserBalance(order.user_id, order.amount);

      console.log('充值审核通过，用户余额已更新:', {
        userId: order.user_id,
        amount: order.amount,
      });
    }

    console.log('充值审核成功:', { orderNo, auditStatus });

    return {
      orderNo,
      auditStatus,
      approved,
      remark,
      message: approved ? '审核通过，充值成功' : '审核已拒绝',
    };
  }

  // 获取待审核充值订单列表（管理员）
  async getPendingAuditOrders(limit: number = 20) {
    console.log('获取待审核充值订单列表:', { limit });

    const { data, error } = await this.supabase
      .from('recharge_orders')
      .select(`
        *,
        user:user_id (
          id,
          username,
          role
        ),
        auditor:audited_by (
          id,
          username
        )
      `)
      .eq('audit_status', 'submitted')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('获取待审核订单失败:', error);
      throw new BadRequestException('获取待审核订单失败: ' + error.message);
    }

    return data || [];
  }

  // 获取用户充值订单列表（包含审核状态）
  async getUserRechargeOrders(userId: string) {
    console.log('获取用户充值订单列表:', { userId });

    const { data, error } = await this.supabase
      .from('recharge_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('获取用户充值订单失败:', error);
      throw new BadRequestException('获取用户充值订单失败: ' + error.message);
    }

    return data || [];
  }

  // 获取商户收款码配置
  async getMerchantQrCodes() {
    console.log('获取商户收款码配置');

    // 从环境变量读取通用收款码
    // 开发环境默认值（生产环境请在部署平台配置环境变量）
    const qrCode = process.env.MERCHANT_QR_CODE || 'https://dwswtkfbtdohaftnklxx.supabase.co/storage/v1/object/public/qrcodes/0f4d33663fcd22d619c950ba281efc91.jpg';
    const merchantName = process.env.MERCHANT_NAME || '中医智能诊疗';

    return {
      merchantName,
      qrCode,
      instructions: [
        '1. 选择套餐并创建订单',
        '2. 使用微信、支付宝或云闪付扫描上方二维码',
        '3. 输入待付款金额完成转账',
        '4. 保存转账成功页面截图',
        '5. 上传转账截图并提交审核',
        '6. 等待管理员确认到账',
      ],
      notice: '请确保转账金额与订单金额一致，便于管理员核对',
    };
  }
}
