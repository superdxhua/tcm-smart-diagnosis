import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('未提供认证信息');
    }

    try {
      // 简单的 base64 解码（实际应使用 JWT 验证）
      const token = authHeader.replace('Bearer ', '');
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());

      // 将用户信息附加到请求对象
      request.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('无效的认证信息');
    }
  }
}
