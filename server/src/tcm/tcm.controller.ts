import { Controller, Get, Post, Body, HttpException, HttpStatus, Headers, Req, Param } from '@nestjs/common';
import { TcmService } from './tcm.service';
import { AnalyzeRequest } from './tcm.interfaces';
import { AuthService } from '../auth/auth.service';
import { HeaderUtils } from 'coze-coding-dev-sdk';

@Controller('tcm')
export class TcmController {
  constructor(
    private readonly tcmService: TcmService,
    private readonly authService: AuthService,
  ) {}

  @Post('analyze')
  async analyzeSymptoms(
    @Req() req: any,
    @Body() body: AnalyzeRequest,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('收到中医诊疗请求:', JSON.stringify(body, null, 2));

    // 提取并设置 customHeaders（必需）
    const rawCustomHeaders = HeaderUtils.extractForwardHeaders(req.headers);

    // 🚨 过滤掉 authorization 字段，避免 token 格式错误
    const customHeaders = Object.fromEntries(
      Object.entries(rawCustomHeaders).filter(([key]) => key.toLowerCase() !== 'authorization')
    );

    this.tcmService.setCustomHeaders(customHeaders);
    console.log('CustomHeaders 已提取并设置:', Object.keys(customHeaders).join(', '));

    const { chiefComplaint, history = '', pastHistory = '', aiInquiry = '', additionalInfo = '', patientId, isFollowUp } = body;

    // 参数验证
    if (!chiefComplaint || chiefComplaint.trim().length === 0) {
      throw new HttpException(
        {
          code: 400,
          msg: '主诉不能为空',
        },
        HttpStatus.OK,
      );
    }

    // 提取用户角色和审核状态信息
    let userRole: string | undefined;
    let auditStatus: string | undefined;
    let userId: string | undefined;
    try {
      const token = authHeader?.replace('Bearer ', '');
      if (token) {
        const user = await this.authService.verifyToken(token);
        userRole = user.role;
        auditStatus = user.auditStatus;
        userId = user.id;
        console.log('账户角色:', userRole, '审核状态:', auditStatus, '账户ID:', userId);

        // 对于机构账户，如果未审核通过，权限等同于个人账户
        if (userRole === 'institution' && auditStatus !== 'approved') {
          console.log('机构账户未审核通过，权限降级为个人账户');
          userRole = 'individual'; // 临时降级权限
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 不影响诊疗流程，只是无法进行权限控制
    }

    try {
      const result = await this.tcmService.analyzeSymptoms({
        chiefComplaint,
        history,
        pastHistory,
        aiInquiry,
        additionalInfo,
        userId, // 传递用户 ID 用于异常检测
        patientId,
        isFollowUp,
        userRole, // 传递用户角色（可能已被降级）
        auditStatus, // 传递审核状态
      });

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('诊疗分析失败:', error);
      throw new HttpException(
        {
          code: 500,
          msg: error.message || '诊疗分析失败',
        },
        HttpStatus.OK,
      );
    }
  }

  // ============================================
  // 方证知识库 API 端点
  // ============================================

  /**
   * 获取所有方剂数据
   */
  @Get('formulas')
  async getAllFormulas() {
    console.log('获取所有方剂数据');
    const formulas = this.tcmService.getAllFormulas();
    return {
      code: 200,
      msg: 'success',
      data: {
        total: formulas.length,
        formulas: formulas,
      },
    };
  }

  /**
   * 获取方剂统计信息（必须放在 formulas/:name 之前，避免被路由匹配优先级覆盖）
   */
  @Get('formulas/statistics')
  async getFormulaStatistics() {
    console.log('获取方剂统计信息');
    const stats = this.tcmService.getFormulaStatistics();
    return {
      code: 200,
      msg: 'success',
      data: stats,
    };
  }

  /**
   * 根据六经分类获取方剂
   */
  @Get('formulas/meridian/:meridian')
  async getFormulasByMeridian(@Param('meridian') meridian: string) {
    console.log(`获取 ${meridian} 病方剂`);
    const formulas = this.tcmService.getFormulasByMeridian(meridian);
    return {
      code: 200,
      msg: 'success',
      data: {
        meridian,
        total: formulas.length,
        formulas: formulas,
      },
    };
  }

  /**
   * 根据症状匹配方剂
   */
  @Post('formulas/match')
  async matchFormulasBySymptoms(@Body() body: { symptoms: string[] }) {
    console.log('根据症状匹配方剂:', body.symptoms);
    const results = this.tcmService.matchFormulasBySymptoms(body.symptoms || []);
    return {
      code: 200,
      msg: 'success',
      data: {
        symptoms: body.symptoms,
        total: results.length,
        matches: results.slice(0, 20), // 只返回前 20 个匹配结果
      },
    };
  }

  /**
   * 根据治法分类获取方剂
   */
  @Get('formulas/treatment/:treatmentMethod')
  async getFormulasByTreatmentMethod(@Param('treatmentMethod') treatmentMethod: string) {
    console.log(`获取治法为 ${treatmentMethod} 的方剂`);
    const formulas = this.tcmService.getFormulasByTreatmentMethod(treatmentMethod);
    return {
      code: 200,
      msg: 'success',
      data: {
        treatmentMethod,
        total: formulas.length,
        formulas: formulas,
      },
    };
  }

  /**
   * 根据方剂名称获取详细信息（必须放在最后，避免覆盖其他路由）
   */
  @Get('formulas/:name')
  async getFormulaByName(@Param('name') name: string) {
    console.log(`获取方剂 ${name} 的详细信息`);
    const formula = this.tcmService.getFormulaByName(name);
    if (!formula) {
      return {
        code: 404,
        msg: '方剂未找到',
        data: null,
      };
    }
    return {
      code: 200,
      msg: 'success',
      data: formula,
    };
  }
}
