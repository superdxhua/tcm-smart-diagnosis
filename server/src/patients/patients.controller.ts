import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, Headers, HttpException, HttpStatus } from '@nestjs/common'
import { PatientsService } from './patients.service'
import { AuthService } from '../auth/auth.service'

@Controller('members')
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly authService: AuthService
  ) {}

  @Get()
  async findAll() {
    return {
      code: 200,
      msg: 'success',
      data: await this.patientsService.findAll()
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const member = await this.patientsService.findOne(id)
    if (!member) {
      throw new NotFoundException('用户不存在')
    }
    return {
      code: 200,
      msg: 'success',
      data: member
    }
  }

  @Post()
  async create(@Body() body: any, @Headers('authorization') authHeader: string) {
    console.log('创建用户 - 接收到的数据:', JSON.stringify(body, null, 2))
    console.log('用户名称:', body.name, '类型:', typeof body.name, '长度:', body.name?.length)

    // 提取用户信息
    let userRole: string | undefined
    try {
      const token = authHeader?.replace('Bearer ', '');
      if (token) {
        const user = await this.authService.verifyToken(token);
        userRole = user.role;
        console.log('用户角色:', userRole);

        // 个人用户添加用户数量上限检查
        if (userRole === 'individual') {
          const memberCount = await this.patientsService.countByUser();
          const maxMembers = 4;

          if (memberCount >= maxMembers) {
            throw new HttpException(
              {
                code: 403,
                msg: `个人账户最多只能添加 ${maxMembers} 位用户，您已达到上限。如需添加更多用户，请联系管理员申请机构资质认证。`,
              },
              HttpStatus.OK,
            );
          }

          console.log(`个人账户当前用户数: ${memberCount}/${maxMembers}`);
        }
      }
    } catch (error) {
      // 如果是权限检查错误，直接抛出
      if (error instanceof HttpException) {
        throw error;
      }
      // 其他错误不影响用户创建
      console.error('获取账户信息失败:', error);
    }

    return {
      code: 200,
      msg: 'success',
      data: await this.patientsService.create(body)
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const member = await this.patientsService.update(id, body)
    if (!member) {
      throw new NotFoundException('用户不存在')
    }
    return {
      code: 200,
      msg: 'success',
      data: member
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    // 提取用户信息
    let userRole: string | undefined
    try {
      const token = authHeader?.replace('Bearer ', '');
      if (token) {
        const user = await this.authService.verifyToken(token);
        userRole = user.role;
        console.log('账户角色:', userRole);

        // 个人账户不能删除用户
        if (userRole === 'individual') {
          throw new HttpException(
            {
              code: 403,
              msg: '个人账户没有删除用户的权限。如需删除用户，请联系管理员申请机构资质认证。',
            },
            HttpStatus.OK,
          );
        }
      }
    } catch (error) {
      // 如果是权限检查错误，直接抛出
      if (error instanceof HttpException) {
        throw error;
      }
      // 其他错误不影响删除操作
      console.error('获取用户信息失败:', error);
    }

    const result = await this.patientsService.remove(id)
    if (!result) {
      throw new NotFoundException('用户不存在')
    }
    return {
      code: 200,
      msg: 'success',
      data: result
    }
  }
}
