import { Controller, Post, Body, Get, Delete, Put, Param, Headers, UseGuards, HttpException, HttpStatus, Query } from '@nestjs/common';
import { AdminService, CreateUserRequest, UpdateUserStatusRequest, UpdateSecondaryAdminRequest, GetUsersQuery } from './admin.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { AuthService } from '@/auth/auth.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
  ) {}

  /**
   * 验证管理员权限
   */
  private async verifyAdmin(authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      throw new HttpException(
        { code: 401, msg: '未授权' },
        HttpStatus.OK,
      );
    }

    const user = await this.authService.verifyToken(token);
    if (user.role !== 'admin') {
      throw new HttpException(
        { code: 403, msg: '需要管理员权限' },
        HttpStatus.OK,
      );
    }

    return user;
  }

  /**
   * 管理员创建用户
   */
  @Post('users')
  async createUser(
    @Body() body: CreateUserRequest,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('收到管理员创建用户请求:', body.username);

    try {
      const admin = await this.verifyAdmin(authHeader);
      const user = await this.adminService.createUser(body, admin.id);

      return {
        code: 200,
        msg: '创建用户成功',
        data: user,
      };
    } catch (error) {
      console.error('创建用户失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 删除用户
   */
  @Delete('users/:userId')
  async deleteUser(
    @Param('userId') userId: string,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('收到删除用户请求:', userId);

    try {
      await this.verifyAdmin(authHeader);
      await this.adminService.deleteUser(userId);

      return {
        code: 200,
        msg: '删除用户成功',
      };
    } catch (error) {
      console.error('删除用户失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 禁用/启用用户
   */
  @Put('users/:userId/status')
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() body: UpdateUserStatusRequest,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('收到更新用户状态请求:', userId, body.isActive);

    try {
      await this.verifyAdmin(authHeader);
      const user = await this.adminService.updateUserStatus(userId, body);

      return {
        code: 200,
        msg: '更新用户状态成功',
        data: user,
      };
    } catch (error) {
      console.error('更新用户状态失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 获取用户列表
   */
  @Get('users')
  async getAllUsers(@Headers('authorization') authHeader: string) {
    console.log('收到获取用户列表请求');

    try {
      await this.verifyAdmin(authHeader);
      const users = await this.adminService.getAllUsers();

      return {
        code: 200,
        msg: 'success',
        data: users,
      };
    } catch (error) {
      console.error('获取用户列表失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 获取用户详情
   */
  @Get('users/:userId')
  async getUserById(
    @Param('userId') userId: string,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('收到获取用户详情请求:', userId);

    try {
      await this.verifyAdmin(authHeader);
      const user = await this.adminService.getUserById(userId);

      return {
        code: 200,
        msg: 'success',
        data: user,
      };
    } catch (error) {
      console.error('获取用户详情失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 获取充值审核统计数据
   */
  @Get('recharge-audit-stats')
  async getRechargeAuditStats(@Headers('authorization') authHeader: string) {
    console.log('收到获取充值审核统计数据请求');

    try {
      await this.verifyAdmin(authHeader);
      const stats = await this.adminService.getRechargeAuditStats();

      return {
        code: 200,
        msg: 'success',
        data: stats,
      };
    } catch (error) {
      console.error('获取充值审核统计数据失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 获取充值订单表更新 SQL 脚本
   */
  @Get('update-recharge-orders-table')
  async getUpdateRechargeOrdersTableSql(@Headers('authorization') authHeader: string) {
    console.log('收到获取充值订单表更新 SQL 脚本请求');

    try {
      await this.verifyAdmin(authHeader);

      const sql = `
-- 添加截图URL字段
ALTER TABLE public.recharge_orders
ADD COLUMN IF NOT EXISTS screenshot_url VARCHAR(512);

-- 添加审核状态字段
ALTER TABLE public.recharge_orders
ADD COLUMN IF NOT EXISTS audit_status VARCHAR(20) DEFAULT 'pending' NOT NULL;

-- 添加审核备注字段
ALTER TABLE public.recharge_orders
ADD COLUMN IF NOT EXISTS audit_remark TEXT;

-- 添加审核人ID字段
ALTER TABLE public.recharge_orders
ADD COLUMN IF NOT EXISTS audited_by VARCHAR(36);

-- 添加审核时间字段
ALTER TABLE public.recharge_orders
ADD COLUMN IF NOT EXISTS audited_at TIMESTAMPTZ;

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_recharge_orders_audit_status
ON public.recharge_orders(audit_status);

-- 添加外键约束（审核人关联用户表）
ALTER TABLE public.recharge_orders
ADD CONSTRAINT IF NOT EXISTS recharge_orders_audited_by_users_id_fk
FOREIGN KEY (audited_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- 更新现有记录的审核状态（设置为pending）
UPDATE public.recharge_orders
SET audit_status = 'pending'
WHERE audit_status IS NULL;
      `.trim();

      return {
        code: 200,
        msg: 'success',
        data: {
          sql,
          instructions: '请将上述 SQL 脚本复制到 Supabase 控制台的 SQL 编辑器中执行',
        },
      };
    } catch (error) {
      console.error('获取 SQL 脚本失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 初始化套餐数据
   */
  @Post('init-packages')
  async initPackages(@Headers('authorization') authHeader: string) {
    console.log('收到初始化套餐数据请求');

    try {
      const admin = await this.verifyAdmin(authHeader);
      const packages = await this.adminService.initPackages();

      return {
        code: 200,
        msg: '套餐初始化成功',
        data: packages,
      };
    } catch (error) {
      console.error('初始化套餐数据失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 获取所有套餐
   */
  @Get('packages')
  async getAllPackages(@Headers('authorization') authHeader: string) {
    console.log('收到获取所有套餐请求');

    try {
      await this.verifyAdmin(authHeader);
      const packages = await this.adminService.getAllPackages();

      return {
        code: 200,
        msg: 'success',
        data: packages,
      };
    } catch (error) {
      console.error('获取套餐列表失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 获取待审核充值订单数量统计
   */
  @Get('pending-recharge-count')
  async getPendingRechargeCount(@Headers('authorization') authHeader: string) {
    console.log('收到获取待审核订单数量请求');

    try {
      await this.verifyAdmin(authHeader);
      const count = await this.adminService.getPendingRechargeCount();

      return {
        code: 200,
        msg: 'success',
        data: { count },
      };
    } catch (error) {
      console.error('获取待审核订单数量失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 获取待审核的充值订单
   */
  @Get('pending-recharge-orders')
  async getPendingRechargeOrders(@Headers('authorization') authHeader: string) {
    console.log('收到获取待审核充值订单请求');

    try {
      await this.verifyAdmin(authHeader);
      const orders = await this.adminService.getPendingRechargeOrders();

      return {
        code: 200,
        msg: 'success',
        data: orders,
      };
    } catch (error) {
      console.error('获取待审核订单失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 审核通过充值订单
   */
  @Post('approve-recharge-order')
  async approveRechargeOrder(
    @Body('orderNo') orderNo: string,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('收到审核通过充值订单请求:', orderNo);

    try {
      const admin = await this.verifyAdmin(authHeader);
      const result = await this.adminService.approveRechargeOrder(orderNo, admin.id);

      return {
        code: 200,
        msg: '审核通过',
        data: result,
      };
    } catch (error) {
      console.error('审核通过失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 审核拒绝充值订单
   */
  @Post('reject-recharge-order')
  async rejectRechargeOrder(
    @Body('orderNo') orderNo: string,
    @Body('remark') remark: string,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('收到审核拒绝充值订单请求:', orderNo, remark);

    try {
      const admin = await this.verifyAdmin(authHeader);
      const result = await this.adminService.rejectRechargeOrder(orderNo, admin.id, remark);

      return {
        code: 200,
        msg: '审核拒绝',
        data: result,
      };
    } catch (error) {
      console.error('审核拒绝失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 设置用户的次级管理员
   */
  @Put('users/:userId/secondary-admin')
  async updateSecondaryAdmin(
    @Param('userId') userId: string,
    @Body() body: UpdateSecondaryAdminRequest,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('收到设置次级管理员请求:', userId, body.secondaryAdmin);

    try {
      const admin = await this.verifyAdmin(authHeader);
      const user = await this.adminService.updateSecondaryAdmin(userId, body, admin.id);

      return {
        code: 200,
        msg: '设置次级管理员成功',
        data: user,
      };
    } catch (error) {
      console.error('设置次级管理员失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 获取用户列表（支持排序和按次级管理员筛选）
   */
  @Get('users-list')
  async getUsersList(
    @Query() query: GetUsersQuery,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('收到获取用户列表请求:', query);

    try {
      await this.verifyAdmin(authHeader);
      const users = await this.adminService.getUsers(query);

      return {
        code: 200,
        msg: 'success',
        data: users,
      };
    } catch (error) {
      console.error('获取用户列表失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 按次级管理员统计用户数量
   */
  @Get('secondary-admin-stats')
  async getSecondaryAdminStats(@Headers('authorization') authHeader: string) {
    console.log('收到按次级管理员统计请求');

    try {
      await this.verifyAdmin(authHeader);
      const stats = await this.adminService.getSecondaryAdminStats();

      return {
        code: 200,
        msg: 'success',
        data: stats,
      };
    } catch (error) {
      console.error('按次级管理员统计失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 获取添加次级管理员字段的 SQL 脚本
   */
  @Get('add-secondary-admin-sql')
  async getAddSecondaryAdminSql(@Headers('authorization') authHeader: string) {
    console.log('收到获取次级管理员 SQL 脚本请求');

    try {
      await this.verifyAdmin(authHeader);

      const sql = `-- 添加次级管理员字段到 users 表
-- 执行时间: 2025-02-21

-- 1. 添加次级管理员字段
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS secondary_admin VARCHAR(100);

-- 2. 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_secondary_admin
ON public.users(secondary_admin);

-- 3. 验证字段是否添加成功
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'secondary_admin';

-- 注意：
-- - secondary_admin 字段用于存储次级管理员信息（可以是手机号或人名）
-- - 该字段为可选字段，允许 NULL 值
-- - 添加了索引以支持按次级管理员快速查询和排序`;

      return {
        code: 200,
        msg: 'success',
        data: {
          sql,
          instructions: '请将上述 SQL 脚本复制到 Supabase 控制台的 SQL 编辑器中执行',
        },
      };
    } catch (error) {
      console.error('获取 SQL 脚本失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 获取付费用户统计信息
   */
  @Get('paid-users-stats')
  async getPaidUsersStats(
    @Query() query: any,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('收到获取付费用户统计请求:', query);

    try {
      await this.verifyAdmin(authHeader);
      const stats = await this.adminService.getPaidUsersStats(query);

      return {
        code: 200,
        msg: 'success',
        data: stats,
      };
    } catch (error) {
      console.error('获取付费用户统计失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 获取免费用户列表
   */
  @Get('free-users')
  async getFreeUsers(@Headers('authorization') authHeader: string) {
    console.log('收到获取免费用户列表请求');

    try {
      await this.verifyAdmin(authHeader);
      const users = await this.adminService.getFreeUsers();

      return {
        code: 200,
        msg: 'success',
        data: users,
      };
    } catch (error) {
      console.error('获取免费用户列表失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }
}
