import { Controller, Post, Body, Get, Headers, HttpException, HttpStatus, Req, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { LoginRequest, RegisterRequest, AuthorizeUserRequest, UpdatePermissionRequest, UploadQualificationsRequest, AuditUserRequest, UpdateUserRequest } from './auth.interfaces';
import { JwtAuthGuard } from './jwt-auth.guard';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Controller('auth')
export class AuthController {
  private supabase = getSupabaseClient();

  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService
  ) {}

  /**
   * 提取客户端IP地址
   */
  private extractIp(req: Request): string {
    // 尝试从各种header中获取真实IP
    const headers = req.headers;
    const forwardedFor = headers['x-forwarded-for'] as string;
    const realIp = headers['x-real-ip'] as string;
    const cfConnectingIp = headers['cf-connecting-ip'] as string;

    if (forwardedFor) {
      // x-forwarded-for 可能包含多个IP，取第一个
      return forwardedFor.split(',')[0].trim();
    }

    if (realIp) {
      return realIp;
    }

    if (cfConnectingIp) {
      return cfConnectingIp;
    }

    // 回退到连接IP
    return req.socket.remoteAddress || '127.0.0.1';
  }

  @Post('login')
  async login(@Body() body: LoginRequest, @Req() req: Request) {
    const ipAddress = this.extractIp(req);
    console.log('收到登录请求:', body.username, 'IP:', ipAddress);

    try {
      const result = await this.authService.login(body, {
        ipAddress,
        userAgent: req.headers['user-agent'] as string,
      });
      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('登录失败:', error.message);
      throw new HttpException(
        {
          code: 401,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 微信一键登录
   */
  @Post('wechat-login')
  async wechatLogin(@Body() body: { code: string }, @Req() req: Request) {
    const { code } = body;
    const ipAddress = this.extractIp(req);
    console.log('收到微信登录请求, IP:', ipAddress);

    try {
      const result = await this.authService.wechatLogin(code, {
        ipAddress,
        userAgent: req.headers['user-agent'] as string,
      });
      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('微信登录失败:', error.message);
      throw new HttpException(
        {
          code: 401,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  @Post('register')
  async register(@Body() body: RegisterRequest) {
    console.log('收到注册请求:', body.username);

    try {
      const user = await this.authService.register(body);
      return {
        code: 200,
        msg: 'success',
        data: user,
      };
    } catch (error) {
      console.error('注册失败:', error.message);
      throw new HttpException(
        {
          code: 400,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  @Post('authorize')
  async authorizeUser(
    @Body() body: AuthorizeUserRequest,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('收到授权请求');

    try {
      // 验证管理员权限
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 401, msg: '未授权' },
          HttpStatus.OK,
        );
      }

      const admin = await this.authService.verifyToken(token);
      if (admin.role !== 'admin') {
        throw new HttpException(
          { code: 403, msg: '需要管理员权限' },
          HttpStatus.OK,
        );
      }

      await this.authService.authorizeUser(body, admin.id);

      return {
        code: 200,
        msg: '授权成功',
      };
    } catch (error) {
      console.error('授权失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  @Get('users')
  async getAllUsers(@Headers('authorization') authHeader: string) {
    console.log('收到获取用户列表请求');

    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 401, msg: '未授权' },
          HttpStatus.OK,
        );
      }

      const admin = await this.authService.verifyToken(token);
      if (admin.role !== 'admin') {
        throw new HttpException(
          { code: 403, msg: '需要管理员权限' },
          HttpStatus.OK,
        );
      }

      const users = await this.authService.getAllUsers();
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

  @Get('users/:userId/permissions')
  async getUserPermissions(
    @Headers('authorization') authHeader: string,
  ) {
    console.log('收到获取用户权限请求');

    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 401, msg: '未授权' },
          HttpStatus.OK,
        );
      }

      const admin = await this.authService.verifyToken(token);
      if (admin.role !== 'admin') {
        throw new HttpException(
          { code: 403, msg: '需要管理员权限' },
          HttpStatus.OK,
        );
      }

      // 从请求中获取 userId（实际应该从路由参数获取，这里简化处理）
      const { data: permissions } = await this.supabase
        .from('user_permissions')
        .select('*')
        .order('created_at', { ascending: false });

      return {
        code: 200,
        msg: 'success',
        data: permissions || [],
      };
    } catch (error) {
      console.error('获取用户权限失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  @Post('permissions/update')
  async updatePermission(
    @Body() body: UpdatePermissionRequest,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('收到更新权限请求:', body.permissionId);

    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 401, msg: '未授权' },
          HttpStatus.OK,
        );
      }

      const admin = await this.authService.verifyToken(token);
      if (admin.role !== 'admin') {
        throw new HttpException(
          { code: 403, msg: '需要管理员权限' },
          HttpStatus.OK,
        );
      }

      await this.authService.updatePermission(
        body.permissionId,
        body.expiresAt,
        body.isActive,
      );

      return {
        code: 200,
        msg: '更新成功',
      };
    } catch (error) {
      console.error('更新权限失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  @Post('logout')
  async logout(@Headers('authorization') authHeader: string) {
    console.log('收到退出登录请求');

    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 400, msg: '无效的请求' },
          HttpStatus.OK,
        );
      }

      await this.authService.logout(token);

      return {
        code: 200,
        msg: '退出登录成功',
      };
    } catch (error) {
      console.error('退出登录失败:', error.message);
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
   * 机构用户上传资质证明
   */
  @Post('upload-qualifications')
  @UseGuards(JwtAuthGuard)
  async uploadQualifications(
    @Body() body: UploadQualificationsRequest,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('收到上传资质证明请求');

    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 401, msg: '未授权' },
          HttpStatus.OK,
        );
      }

      const user = await this.authService.verifyToken(token);

      await this.authService.uploadQualifications(user.id, body);

      return {
        code: 200,
        msg: '资质证明上传成功，等待管理员审核',
      };
    } catch (error) {
      console.error('上传资质证明失败:', error.message);
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
   * 管理员获取待审核机构用户列表
   */
  @Get('pending-institutions')
  @UseGuards(JwtAuthGuard)
  async getPendingInstitutions(@Headers('authorization') authHeader: string) {
    console.log('收到获取待审核机构用户列表请求');

    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 401, msg: '未授权' },
          HttpStatus.OK,
        );
      }

      const admin = await this.authService.verifyToken(token);
      if (admin.role !== 'admin') {
        throw new HttpException(
          { code: 403, msg: '需要管理员权限' },
          HttpStatus.OK,
        );
      }

      const institutions = await this.authService.getPendingInstitutions();

      return {
        code: 200,
        msg: 'success',
        data: institutions,
      };
    } catch (error) {
      console.error('获取待审核机构用户列表失败:', error.message);
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
   * 小程序端手机号授权注册
   */
  @Post('register-weapp')
  async registerWeapp(@Body() body: { code: string }) {
    console.log('收到小程序注册请求');

    try {
      const result = await this.authService.registerWeapp(body.code);
      return {
        code: 200,
        msg: '注册成功',
        data: result,
      };
    } catch (error) {
      console.error('小程序注册失败:', error.message);
      throw new HttpException(
        {
          code: 400,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * H5 端手机号注册
   */
  @Post('register-phone')
  async registerPhone(@Body() body: { phone: string }) {
    console.log('收到 H5 注册请求:', body.phone);

    try {
      const result = await this.authService.registerPhone(body.phone);
      return {
        code: 200,
        msg: '注册成功',
        data: result,
      };
    } catch (error) {
      console.error('H5 注册失败:', error.message);
      throw new HttpException(
        {
          code: 400,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 管理员审核机构用户
   */
  @Post('audit-user')
  @UseGuards(JwtAuthGuard)
  async auditUser(
    @Body() body: AuditUserRequest,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('收到审核机构用户请求:', body.userId, body.auditStatus);

    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 401, msg: '未授权' },
          HttpStatus.OK,
        );
      }

      const admin = await this.authService.verifyToken(token);
      if (admin.role !== 'admin') {
        throw new HttpException(
          { code: 403, msg: '需要管理员权限' },
          HttpStatus.OK,
        );
      }

      await this.authService.auditUser(admin.id, body);

      return {
        code: 200,
        msg: '审核成功',
      };
    } catch (error) {
      console.error('审核机构用户失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  @Post('update-user')
  async updateUser(
    @Body() body: UpdateUserRequest,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('收到更新用户信息请求');

    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 401, msg: '未授权' },
          HttpStatus.OK,
        );
      }

      const currentUser = await this.authService.verifyToken(token);

      const result = await this.authService.updateUser(body, currentUser.id);

      return {
        code: 200,
        msg: '更新成功',
        data: result,
      };
    } catch (error) {
      console.error('更新用户信息失败:', error.message);
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
   * 上传资质文件（用于机构注册）
   */
  @Post('upload-qualification')
  @UseInterceptors(FileInterceptor('file'))
  async uploadQualification(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { type: string },
  ) {
    console.log('收到资质文件上传请求:', body.type, '文件大小:', file?.size);

    try {
      if (!file) {
        throw new HttpException(
          { code: 400, msg: '请上传文件' },
          HttpStatus.OK,
        );
      }

      const result = await this.authService.uploadQualificationFile(file, body.type);
      return {
        code: 200,
        msg: '上传成功',
        data: result,
      };
    } catch (error) {
      console.error('资质文件上传失败:', error.message);
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
   * 注册机构账户
   */
  @Post('register-institution')
  async registerInstitution(@Body() body: {
    phone: string;
    qualifications: {
      institutionLicense: string;
      practiceLicense: string;
      physicianCert: string;
    };
  }) {
    console.log('收到机构注册请求:', body.phone);

    try {
      const result = await this.authService.registerInstitution(body);
      return {
        code: 200,
        msg: '注册成功，等待审核',
        data: result,
      };
    } catch (error) {
      console.error('机构注册失败:', error.message);
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
