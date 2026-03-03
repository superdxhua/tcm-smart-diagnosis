import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export interface CreateUserRequest {
  username: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export interface UpdateSecondaryAdminRequest {
  secondaryAdmin: string;
}

export interface UserInfo {
  id: string;
  username: string;
  role: 'user' | 'admin';
  isActive: boolean;
  secondaryAdmin?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SecondaryAdminStats {
  secondaryAdmin: string;
  userCount: number;
  users: UserInfo[];
}

export interface GetUsersQuery {
  sortBy?: 'username' | 'secondaryAdmin' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  secondaryAdmin?: string;
}

export interface PaidUserStats {
  userId: string;
  username: string;
  role: string;
  isActive: boolean;
  secondaryAdmin?: string;
  firstPaidAt: string;      // 首次付费时间（如果有）
  firstUploadAt: string;   // 首次上传凭证的时间
  totalRechargeAmount: string;
  totalRechargeCount: number;
  createdAt: string;
}

export interface GetPaidUsersQuery {
  startDate?: string; // ISO date string, e.g., "2025-02-01"（基于上传凭证的时间）
  endDate?: string;   // ISO date string, e.g., "2025-02-28"
  sortBy?: 'firstPaidAt' | 'firstUploadAt' | 'totalRechargeAmount' | 'username';
  sortOrder?: 'asc' | 'desc';
  secondaryAdmin?: string;
}

export interface PaidUserSummary {
  totalPaidUsers: number;
  newPaidUsersInPeriod: number;
  totalRechargeAmount: string;
  periodRechargeAmount: string;
  users: PaidUserStats[];
}

@Injectable()
export class AdminService {
  private supabase = getSupabaseClient();

  /**
   * 创建医案表（如果不存在）
   */
  private async createMedicalCasesTablesIfNotExists() {
    try {
      // 注意：Supabase JS 客户端不支持直接执行 DDL SQL
      // 这里我们通过检查表是否存在来决定是否需要提示用户手动创建
      const { error } = await this.supabase
        .from('medical_cases')
        .select('id')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        console.error('medical_cases 表不存在，请在 Supabase 控制台中手动创建');
        throw new Error('请先在 Supabase 控制台中创建 medical_cases 表');
      }
    } catch (err) {
      // 表不存在
      console.error('检查 medical_cases 表失败', err);
      throw new Error('请先在 Supabase 控制台中创建 medical_cases 表');
    }
  }

  /**
   * 管理员创建用户
   */
  async createUser(request: CreateUserRequest, adminId: string): Promise<UserInfo> {
    const { username, password, role = 'user' } = request;

    // 检查用户名是否已存在
    const { data: existingUser } = await this.supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const { data: user, error } = await this.supabase
      .from('users')
      .insert({
        username,
        password: hashedPassword,
        role,
        is_active: true,
      })
      .select()
      .single();

    console.log('创建用户结果:', { user, error });

    if (error || !user) {
      console.error('创建用户失败:', error);
      throw new BadRequestException('创建用户失败: ' + (error?.message || '未知错误'));
    }

    // 如果创建的是普通用户，自动创建授权记录
    if (role === 'user') {
      await this.supabase
        .from('user_permissions')
        .insert({
          user_id: user.id,
          authorized_by: adminId,
          expires_at: null, // 永久授权
          is_active: true,
        });

      // 创建用户余额账户
      await this.supabase
        .from('user_balance')
        .insert({
          user_id: user.id,
          balance: '0.00',
          total_recharge: '0.00',
          total_consumed: '0.00',
        });
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at || undefined,
    };
  }

  /**
   * 删除用户（硬删除）
   */
  async deleteUser(userId: string): Promise<void> {
    // 检查用户是否存在
    const { data: user } = await this.supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 禁止删除管理员账户
    if (user.role === 'admin') {
      throw new BadRequestException('不能删除管理员账户');
    }

    // 删除用户（级联删除会自动删除相关数据）
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      throw new BadRequestException('删除用户失败');
    }
  }

  /**
   * 禁用/启用用户
   */
  async updateUserStatus(userId: string, request: UpdateUserStatusRequest): Promise<UserInfo> {
    const { isActive } = request;

    // 检查用户是否存在
    const { data: user } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 禁止禁用管理员账户
    if (user.role === 'admin' && !isActive) {
      throw new BadRequestException('不能禁用管理员账户');
    }

    // 更新用户状态
    const { data: updatedUser, error } = await this.supabase
      .from('users')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error || !updatedUser) {
      throw new BadRequestException('更新用户状态失败');
    }

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
      isActive: updatedUser.is_active,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at || undefined,
    };
  }

  /**
   * 设置用户的次级管理员
   */
  async updateSecondaryAdmin(userId: string, request: UpdateSecondaryAdminRequest, adminId: string): Promise<UserInfo> {
    const { secondaryAdmin } = request;

    // 检查用户是否存在
    const { data: user } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 更新次级管理员
    const { data: updatedUser, error } = await this.supabase
      .from('users')
      .update({
        secondary_admin: secondaryAdmin || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error || !updatedUser) {
      throw new BadRequestException('更新次级管理员失败');
    }

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
      isActive: updatedUser.is_active,
      secondaryAdmin: updatedUser.secondary_admin || undefined,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at || undefined,
    };
  }

  /**
   * 获取所有用户列表（支持排序和筛选）
   */
  async getUsers(query?: GetUsersQuery): Promise<UserInfo[]> {
    const { sortBy = 'createdAt', sortOrder = 'desc', secondaryAdmin } = query || {};

    let dbQuery = this.supabase
      .from('users')
      .select('*');

    // 按次级管理员筛选
    if (secondaryAdmin) {
      dbQuery = dbQuery.eq('secondary_admin', secondaryAdmin);
    }

    // 排序
    const columnMap = {
      username: 'username',
      secondaryAdmin: 'secondary_admin',
      createdAt: 'created_at',
    };

    const orderColumn = columnMap[sortBy] || 'created_at';
    dbQuery = dbQuery.order(orderColumn, { ascending: sortOrder === 'asc' });

    const { data: users, error } = await dbQuery;

    if (error) {
      throw new BadRequestException('获取用户列表失败');
    }

    return (users || []).map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
      isActive: user.is_active,
      secondaryAdmin: user.secondary_admin || undefined,
      createdAt: user.created_at,
      updatedAt: user.updated_at || undefined,
    }));
  }

  /**
   * 按次级管理员统计用户数量
   */
  async getSecondaryAdminStats(): Promise<SecondaryAdminStats[]> {
    // 获取所有用户
    const { data: users, error } = await this.supabase
      .from('users')
      .select('*')
      .order('secondary_admin', { ascending: true });

    if (error) {
      throw new BadRequestException('获取用户列表失败');
    }

    // 按次级管理员分组统计
    const statsMap = new Map<string, UserInfo[]>();

    users?.forEach(user => {
      const adminName = user.secondary_admin || '未分配';
      if (!statsMap.has(adminName)) {
        statsMap.set(adminName, []);
      }
      statsMap.get(adminName)?.push({
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.is_active,
        secondaryAdmin: user.secondary_admin || undefined,
        createdAt: user.created_at,
        updatedAt: user.updated_at || undefined,
      });
    });

    // 转换为统计数组
    return Array.from(statsMap.entries()).map(([secondaryAdmin, users]) => ({
      secondaryAdmin,
      userCount: users.length,
      users,
    }));
  }

  /**
   * 获取用户列表
   */
  async getAllUsers(): Promise<UserInfo[]> {
    const { data: users } = await this.supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    return (users || []).map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at || undefined,
    }));
  }

  /**
   * 获取用户详情
   */
  async getUserById(userId: string): Promise<UserInfo> {
    const { data: user } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at || undefined,
    };
  }

  /**
   * 初始化医案数据
   */
  async initMedicalCases() {
    // 检查表是否存在
    try {
      const { error: checkError } = await this.supabase
        .from('medical_cases')
        .select('id')
        .limit(1);

      if (checkError && checkError.code === 'PGRST116') {
        return {
          code: 400,
          msg: 'medical_cases 表不存在',
          data: {
            instructions: '请先在 Supabase 控制台的 SQL Editor 中执行以下 SQL 创建表：',
            sql: `
-- 创建 medical_cases 表
CREATE TABLE IF NOT EXISTS public.medical_cases (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_name VARCHAR(100) NOT NULL,
  doctor_era VARCHAR(50),
  patient_gender VARCHAR(10),
  patient_age INTEGER,
  main_symptoms TEXT NOT NULL,
  current_illness TEXT,
  past_history TEXT,
  tongue VARCHAR(200),
  pulse VARCHAR(200),
  diagnosis TEXT NOT NULL,
  prescription_name VARCHAR(200),
  prescription_composition TEXT,
  prescription_dosage TEXT,
  prescription_usage TEXT,
  treatment_result TEXT,
  notes TEXT,
  source VARCHAR(200),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  symptom_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  diagnosis_pattern VARCHAR(200),
  effectiveness_score NUMERIC(3, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 medical_case_feedback 表
CREATE TABLE IF NOT EXISTS public.medical_case_feedback (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36),
  success BOOLEAN NOT NULL,
  feedback_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_case FOREIGN KEY (case_id) REFERENCES public.medical_cases(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_medical_cases_doctor_name ON public.medical_cases(doctor_name);
CREATE INDEX IF NOT EXISTS idx_medical_cases_diagnosis ON public.medical_cases(diagnosis);
CREATE INDEX IF NOT EXISTS idx_medical_cases_tags ON public.medical_cases USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_medical_case_feedback_case_id ON public.medical_case_feedback(case_id);

-- 启用行级安全策略
ALTER TABLE public.medical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_case_feedback ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取医案数据
CREATE POLICY IF NOT EXISTS "Allow public read access" ON public.medical_cases FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access" ON public.medical_case_feedback FOR SELECT USING (true);

-- 允许认证用户插入医案
CREATE POLICY IF NOT EXISTS "Allow authenticated insert" ON public.medical_cases FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow authenticated insert" ON public.medical_case_feedback FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 允许认证用户更新医案
CREATE POLICY IF NOT EXISTS "Allow authenticated update" ON public.medical_cases FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow authenticated update" ON public.medical_case_feedback FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 允许认证用户删除医案
CREATE POLICY IF NOT EXISTS "Allow authenticated delete" ON public.medical_cases FOR DELETE USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow authenticated delete" ON public.medical_case_feedback FOR DELETE USING (auth.uid() IS NOT NULL);
            `.trim(),
          },
        };
      }
    } catch (err) {
      console.error('检查 medical_cases 表失败', err);
    }

    const sampleCases = [
      {
        doctor_name: '张仲景',
        doctor_era: '东汉',
        patient_gender: '男',
        patient_age: 35,
        main_symptoms: '发热恶寒，头痛身痛，无汗而喘，脉浮紧',
        current_illness: '昨天淋雨受凉，今晨开始发热，体温38.5℃',
        past_history: '平时体质一般，无重大疾病史',
        tongue: '舌淡苔薄白',
        pulse: '脉浮紧',
        diagnosis: '太阳病风寒表实证（外感风寒表实证）',
        prescription_name: '麻黄汤',
        prescription_composition: '麻黄9g（先煎去沫）、桂枝6g、炙甘草3g、杏仁9g（去皮尖，捣碎）',
        prescription_dosage: '一剂，水煎两次，分服',
        prescription_usage: '温服，服药后加盖衣被以助发汗',
        treatment_result: '服药后1小时得微汗，发热消退，头痛身痛明显缓解，次日痊愈',
        notes: '麻黄汤为辛温解表之代表方，专治太阳病风寒表实证',
        source: '《伤寒论》',
        tags: ['太阳病', '风寒表实证', '感冒', '麻黄汤'],
        symptom_keywords: ['发热', '恶寒', '头痛', '身痛', '无汗', '喘', '脉浮紧'],
        diagnosis_pattern: '太阳病',
        effectiveness_score: 0.95,
      },
      {
        doctor_name: '张仲景',
        doctor_era: '东汉',
        patient_gender: '女',
        patient_age: 28,
        main_symptoms: '发热，汗出恶风，头痛，脉浮缓',
        current_illness: '三天前外出受风，开始发热，伴有汗出',
        past_history: '体虚易感冒',
        tongue: '舌淡苔薄白',
        pulse: '脉浮缓',
        diagnosis: '太阳病中风证（营卫不和）',
        prescription_name: '桂枝汤',
        prescription_composition: '桂枝9g、芍药9g、炙甘草6g、生姜9g、大枣12枚',
        prescription_dosage: '一剂，水煎两次，分服',
        prescription_usage: '温服，服药后喝热粥以助药力，微汗即止',
        treatment_result: '服药后微汗出，发热消退，诸症悉除',
        notes: '桂枝汤为调和营卫之代表方，专治太阳病中风证',
        source: '《伤寒论》',
        tags: ['太阳病', '中风证', '营卫不和', '桂枝汤'],
        symptom_keywords: ['发热', '汗出', '恶风', '头痛', '脉浮缓'],
        diagnosis_pattern: '太阳病',
        effectiveness_score: 0.92,
      },
      {
        doctor_name: '张仲景',
        doctor_era: '东汉',
        patient_gender: '男',
        patient_age: 45,
        main_symptoms: '往来寒热，胸胁苦满，嘿嘿不欲饮食，心烦喜呕',
        current_illness: '一周前外感，治疗后发热退，但出现寒热往来',
        past_history: '平素情志不畅',
        tongue: '舌淡红苔薄黄',
        pulse: '脉弦',
        diagnosis: '少阳病',
        prescription_name: '小柴胡汤',
        prescription_composition: '柴胡24g、黄芩9g、人参9g、半夏9g、甘草6g、生姜9g、大枣12枚',
        prescription_dosage: '一剂，水煎两次，分早晚两次温服',
        prescription_usage: '分早晚两次温服',
        treatment_result: '服药3剂，寒热往来消失，胸胁舒畅，饮食增加',
        notes: '小柴胡汤为和解少阳之代表方，专治少阳病',
        source: '《伤寒论》',
        tags: ['少阳病', '寒热往来', '小柴胡汤'],
        symptom_keywords: ['寒热往来', '胸胁苦满', '嘿嘿不欲饮食', '心烦喜呕', '脉弦'],
        diagnosis_pattern: '少阳病',
        effectiveness_score: 0.90,
      },
      {
        doctor_name: '张仲景',
        doctor_era: '东汉',
        patient_gender: '女',
        patient_age: 32,
        main_symptoms: '心烦不眠，心悸怔忡，头晕目眩，面色萎黄',
        current_illness: '最近工作压力大，经常熬夜，精神疲倦',
        past_history: '无',
        tongue: '舌淡苔薄白',
        pulse: '脉细数',
        diagnosis: '心脾两虚证',
        prescription_name: '归脾汤',
        prescription_composition: '黄芪15g、党参12g、白术10g、茯苓12g、龙眼肉12g、炒酸枣仁15g、当归10g、远志6g、木香6g、炙甘草6g',
        prescription_dosage: '一剂，水煎两次，分早晚两次温服',
        prescription_usage: '饭后1小时服用',
        treatment_result: '服药7剂，睡眠改善，心悸缓解，面色转红',
        notes: '归脾汤为补益心脾之代表方，专治心脾两虚',
        source: '《济生方》',
        tags: ['心脾两虚', '不寐', '心悸', '归脾汤'],
        symptom_keywords: ['心烦', '不眠', '心悸', '怔忡', '头晕目眩', '面色萎黄'],
        diagnosis_pattern: '心脾两虚',
        effectiveness_score: 0.88,
      },
      {
        doctor_name: '李可',
        doctor_era: '现代',
        patient_gender: '女',
        patient_age: 38,
        main_symptoms: '心慌气短，动则尤甚，面色苍白，神疲乏力',
        current_illness: '半年前开始心慌，活动后加重',
        past_history: '有贫血史',
        tongue: '舌淡苔薄白',
        pulse: '脉细弱',
        diagnosis: '气血两虚证',
        prescription_name: '炙甘草汤加味',
        prescription_composition: '炙甘草12g、桂枝9g、人参12g、生地黄30g、阿胶9g（烊化）、麦冬12g、麻仁12g、生姜9g、大枣12枚、黄芪30g',
        prescription_dosage: '一剂，水煎两次，分早晚两次温服',
        prescription_usage: '饭后温服，阿胶烊化后兑入药汁',
        treatment_result: '服药14剂，心慌气短明显改善，体力增加，面色转红',
        notes: '炙甘草汤为气血双补之代表方，加黄芪增强补气之力',
        source: '李可老中医医案',
        tags: ['气血两虚', '心悸', '炙甘草汤'],
        symptom_keywords: ['心慌', '气短', '面色苍白', '神疲乏力', '脉细弱'],
        diagnosis_pattern: '气血两虚',
        effectiveness_score: 0.93,
      },
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const caseData of sampleCases) {
      try {
        const caseId = uuidv4();
        const now = new Date().toISOString();

        const { data, error } = await this.supabase
          .from('medical_cases')
          .insert({
            id: caseId,
            ...caseData,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single();

        if (error) {
          console.error(`插入医案失败: ${caseData.doctor_name} - ${caseData.prescription_name}`, error);
          errorCount++;
        } else {
          console.log(`✓ 插入医案成功: ${caseData.doctor_name} - ${caseData.prescription_name}`);
          successCount++;
        }
      } catch (err) {
        console.error(`插入医案异常: ${caseData.doctor_name} - ${caseData.prescription_name}`, err);
        errorCount++;
      }
    }

    return {
      code: 200,
      msg: '初始化完成',
      data: {
        successCount,
        errorCount,
        total: sampleCases.length,
      },
    };
  }

  /**
   * 获取充值审核统计数据（管理员）
   */
  async getRechargeAuditStats() {
    console.log('获取充值审核统计数据');

    // 获取待审核订单数
    const { count: pendingCount, error: pendingError } = await this.supabase
      .from('recharge_orders')
      .select('*', { count: 'exact', head: true })
      .eq('audit_status', 'submitted');

    if (pendingError) {
      console.error('获取待审核订单数失败:', pendingError);
    }

    // 获取今日审核通过订单数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayApprovedCount, error: todayApprovedError } = await this.supabase
      .from('recharge_orders')
      .select('*', { count: 'exact', head: true })
      .eq('audit_status', 'approved')
      .gte('audited_at', today.toISOString());

    if (todayApprovedError) {
      console.error('获取今日审核通过订单数失败:', todayApprovedError);
    }

    // 获取今日审核拒绝订单数
    const { count: todayRejectedCount, error: todayRejectedError } = await this.supabase
      .from('recharge_orders')
      .select('*', { count: 'exact', head: true })
      .eq('audit_status', 'rejected')
      .gte('audited_at', today.toISOString());

    if (todayRejectedError) {
      console.error('获取今日审核拒绝订单数失败:', todayRejectedError);
    }

    // 获取今日充值总金额
    const { data: todayRecharges } = await this.supabase
      .from('recharge_orders')
      .select('amount')
      .eq('audit_status', 'approved')
      .eq('status', 'paid')
      .gte('audited_at', today.toISOString());

    const todayTotalAmount = todayRecharges?.reduce((sum, order) => {
      return sum + parseFloat(order.amount || '0');
    }, 0) || 0;

    return {
      pendingCount: pendingCount || 0,
      todayApprovedCount: todayApprovedCount || 0,
      todayRejectedCount: todayRejectedCount || 0,
      todayTotalAmount,
    };
  }

  /**
   * 初始化套餐数据
   */
  async initPackages() {
    console.log('初始化套餐数据');

    // 检查表是否存在
    try {
      const { error: checkError } = await this.supabase
        .from('packages')
        .select('id')
        .limit(1);

      if (checkError && checkError.code === 'PGRST116') {
        return {
          code: 400,
          msg: 'packages 表不存在',
          data: {
            instructions: '请先在 Supabase 控制台的 SQL Editor 中执行以下 SQL 创建表：',
            sql: `
-- 创建 packages 表
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  duration INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_packages_is_active ON public.packages(is_active);

-- 启用行级安全策略
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取套餐数据
CREATE POLICY IF NOT EXISTS "Allow public read access" ON public.packages FOR SELECT USING (true);

-- 允许认证用户插入套餐
CREATE POLICY IF NOT EXISTS "Allow authenticated insert" ON public.packages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 允许认证用户更新套餐
CREATE POLICY IF NOT EXISTS "Allow authenticated update" ON public.packages FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 允许认证用户删除套餐
CREATE POLICY IF NOT EXISTS "Allow authenticated delete" ON public.packages FOR DELETE USING (auth.uid() IS NOT NULL);
            `.trim(),
          },
        };
      }
    } catch (err) {
      console.error('检查 packages 表失败', err);
    }

    // 定义套餐数据
    const packageData = [
      {
        name: '7天体验',
        duration: 7,
        price: 15,
        description: '适合初次体验用户',
        sort_order: 1,
      },
      {
        name: '1个月标准',
        duration: 30,
        price: 45,
        description: '月度套餐，性价比之选',
        sort_order: 2,
      },
      {
        name: '3个月优惠',
        duration: 90,
        price: 108,
        description: '季度套餐，超值优惠',
        sort_order: 3,
      },
      {
        name: '1年尊享',
        duration: 365,
        price: 365,
        description: '年度套餐，长期使用首选',
        sort_order: 4,
      },
    ];

    // 删除现有套餐（如果存在）
    const { error: deleteError } = await this.supabase
      .from('packages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 删除所有记录

    if (deleteError) {
      console.warn('删除现有套餐失败:', deleteError);
    }

    // 插入新套餐
    let successCount = 0;
    let errorCount = 0;
    const insertedPackages: any[] = [];

    for (const pkg of packageData) {
      try {
        const { data, error } = await this.supabase
          .from('packages')
          .insert(pkg)
          .select()
          .single();

        if (error) {
          console.error(`插入套餐失败: ${pkg.name}`, error);
          errorCount++;
        } else {
          console.log(`✓ 插入套餐成功: ${pkg.name} - ¥${pkg.price}/${pkg.duration}天`);
          successCount++;
          insertedPackages.push(data);
        }
      } catch (err) {
        console.error(`插入套餐异常: ${pkg.name}`, err);
        errorCount++;
      }
    }

    return {
      code: 200,
      msg: '套餐初始化完成',
      data: {
        successCount,
        errorCount,
        total: packageData.length,
        packages: insertedPackages,
      },
    };
  }

  /**
   * 获取所有套餐
   */
  async getAllPackages() {
    const { data: packages, error } = await this.supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new BadRequestException('获取套餐列表失败');
    }

    return (packages || []).map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      duration: pkg.duration,
      price: parseFloat(pkg.price),
      description: pkg.description,
      is_active: pkg.is_active,
      sort_order: pkg.sort_order,
    }));
  }

  /**
   * 获取待审核充值订单数量统计
   */
  async getPendingRechargeCount(): Promise<number> {
    console.log('获取待审核订单数量统计');

    const { count, error } = await this.supabase
      .from('recharge_orders')
      .select('*', { count: 'exact', head: true })
      .in('audit_status', ['pending', 'submitted']);

    if (error) {
      throw new BadRequestException('获取待审核订单数量失败');
    }

    return count || 0;
  }

  /**
   * 获取待审核的充值订单（包含用户信息）
   */
  async getPendingRechargeOrders() {
    console.log('获取待审核充值订单');

    const { data: orders, error } = await this.supabase
      .from('recharge_orders')
      .select(`
        *,
        user:user_id (
          id,
          username,
          role,
          created_at
        )
      `)
      .in('audit_status', ['pending', 'submitted'])
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException('获取待审核订单失败');
    }

    return (orders || []).map(order => ({
      id: order.id,
      orderNo: order.order_no,
      amount: parseFloat(order.amount),
      paymentMethod: order.payment_method,
      status: order.status,
      auditStatus: order.audit_status,
      screenshotUrl: order.screenshot_url,
      auditRemark: order.audit_remark,
      auditedAt: order.audited_at,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      user: {
        id: order.user?.id,
        username: order.user?.username,
        role: order.user?.role,
        createdAt: order.user?.created_at,
      },
    }));
  }

  /**
   * 审核通过充值订单
   */
  async approveRechargeOrder(orderNo: string, adminId: string) {
    console.log('审核通过充值订单:', orderNo, adminId);

    // 查询订单
    const { data: order, error: orderError } = await this.supabase
      .from('recharge_orders')
      .select('*')
      .eq('order_no', orderNo)
      .single();

    if (orderError || !order) {
      throw new BadRequestException('订单不存在');
    }

    // 检查订单状态
    if (order.audit_status === 'approved') {
      throw new BadRequestException('订单已审核通过');
    }

    if (order.audit_status === 'rejected') {
      throw new BadRequestException('订单已审核拒绝，无法再次审核');
    }

    if (order.audit_status !== 'submitted') {
      throw new BadRequestException('订单未提交审核');
    }

    // 更新订单状态
    const { error: updateError } = await this.supabase
      .from('recharge_orders')
      .update({
        audit_status: 'approved',
        status: 'paid',
        audited_by: adminId,
        audited_at: new Date().toISOString(),
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('order_no', orderNo);

    if (updateError) {
      throw new BadRequestException('审核失败');
    }

    // 增加用户使用天数
    const amount = parseFloat(order.amount);
    const daysToAdd = Math.floor(amount / 1); // 1元=1天（可根据套餐逻辑调整）

    // 查询用户权限
    const { data: permissions, error: permError } = await this.supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', order.user_id)
      .single();

    if (permError || !permissions) {
      throw new BadRequestException('用户权限不存在');
    }

    // 计算新的到期时间
    let newExpiresAt: string;
    if (permissions.expires_at) {
      // 如果已有到期时间，在其基础上增加
      const currentExpires = new Date(permissions.expires_at);
      const newExpires = new Date(currentExpires.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      newExpiresAt = newExpires.toISOString();
    } else {
      // 如果没有到期时间，从现在开始计算
      const now = new Date();
      const newExpires = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      newExpiresAt = newExpires.toISOString();
    }

    // 更新用户权限
    const { error: permUpdateError } = await this.supabase
      .from('user_permissions')
      .update({
        expires_at: newExpiresAt,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', order.user_id);

    if (permUpdateError) {
      console.error('更新用户权限失败:', permUpdateError);
      throw new BadRequestException('审核通过，但更新用户权限失败');
    }

    return {
      orderNo,
      auditStatus: 'approved',
      daysAdded: daysToAdd,
      newExpiresAt,
    };
  }

  /**
   * 审核拒绝充值订单
   */
  async rejectRechargeOrder(orderNo: string, adminId: string, remark?: string) {
    console.log('审核拒绝充值订单:', orderNo, adminId, remark);

    // 查询订单
    const { data: order, error: orderError } = await this.supabase
      .from('recharge_orders')
      .select('*')
      .eq('order_no', orderNo)
      .single();

    if (orderError || !order) {
      throw new BadRequestException('订单不存在');
    }

    // 检查订单状态
    if (order.audit_status === 'approved') {
      throw new BadRequestException('订单已审核通过，无法拒绝');
    }

    if (order.audit_status === 'rejected') {
      throw new BadRequestException('订单已审核拒绝');
    }

    if (order.audit_status !== 'submitted') {
      throw new BadRequestException('订单未提交审核');
    }

    // 更新订单状态
    const { error: updateError } = await this.supabase
      .from('recharge_orders')
      .update({
        audit_status: 'rejected',
        audited_by: adminId,
        audited_at: new Date().toISOString(),
        audit_remark: remark || '审核拒绝',
        updated_at: new Date().toISOString(),
      })
      .eq('order_no', orderNo);

    if (updateError) {
      throw new BadRequestException('审核失败');
    }

    return {
      orderNo,
      auditStatus: 'rejected',
      remark,
    };
  }

  /**
   * 重置 admin 用户密码（临时接口，仅用于调试）
   */
  async resetAdminPassword(): Promise<{ success: boolean; message: string }> {
    try {
      // 检查 admin 用户是否存在
      const { data: existingUser, error: fetchError } = await this.supabase
        .from('users')
        .select('*')
        .eq('username', 'admin')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        return {
          success: false,
          message: `查询用户失败: ${fetchError.message}`,
        };
      }

      const hashedPassword = await bcrypt.hash('123456', 10);

      if (existingUser) {
        // 更新现有 admin 用户密码
        const { error: updateError } = await this.supabase
          .from('users')
          .update({ password: hashedPassword })
          .eq('username', 'admin');

        if (updateError) {
          return {
            success: false,
            message: `更新密码失败: ${updateError.message}`,
          };
        }

        // 验证密码是否正确
        const { data: verifyUser } = await this.supabase
          .from('users')
          .select('password')
          .eq('username', 'admin')
          .single();

        const isValid = verifyUser ? await bcrypt.compare('123456', verifyUser.password) : false;

        return {
          success: true,
          message: `admin 用户密码已重置为 123456，验证: ${isValid ? '成功' : '失败'}`,
        };
      } else {
        // 创建新的 admin 用户
        const { error: createError } = await this.supabase
          .from('users')
          .insert({
            id: uuidv4(),
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            is_active: true,
            created_at: new Date().toISOString(),
          });

        if (createError) {
          return {
            success: false,
            message: `创建用户失败: ${createError.message}`,
          };
        }

        return {
          success: true,
          message: 'admin 用户创建成功，密码: 123456',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `执行失败: ${err.message}`,
      };
    }
  }

  /**
   * 获取付费用户统计信息
   */
  async getPaidUsersStats(query?: GetPaidUsersQuery): Promise<PaidUserSummary> {
    const { startDate, endDate, sortBy = 'firstPaidAt', sortOrder = 'desc', secondaryAdmin } = query || {};

    // 构建查询条件：查询已上传付款凭证的用户（screenshot_url IS NOT NULL）
    let rechargeQuery = this.supabase
      .from('recharge_orders')
      .select('user_id, amount, created_at, paid_at')
      .not('screenshot_url', 'is', null);

    // 时间范围筛选（基于上传凭证的时间 created_at）
    if (startDate) {
      rechargeQuery = rechargeQuery.gte('created_at', `${startDate}T00:00:00Z`);
    }
    if (endDate) {
      rechargeQuery = rechargeQuery.lte('created_at', `${endDate}T23:59:59Z`);
    }

    const { data: rechargeRecords, error: rechargeError } = await rechargeQuery;

    if (rechargeError) {
      throw new BadRequestException('获取充值记录失败');
    }

    // 按用户分组统计
    const userStatsMap = new Map<string, any>();

    rechargeRecords?.forEach(record => {
      const userId = record.user_id;
      const amount = parseFloat(record.amount);
      const createdAt = record.created_at;
      const paidAt = record.paid_at;

      // 首次付费时间：如果有 paid_at 则用 paid_at，否则用 created_at（上传凭证的时间）
      const firstPaidAt = paidAt || createdAt;

      if (!userStatsMap.has(userId)) {
        userStatsMap.set(userId, {
          userId,
          firstPaidAt,
          firstUploadAt: createdAt, // 首次上传凭证的时间
          totalRechargeAmount: 0,
          totalRechargeCount: 0,
        });
      }

      const stats = userStatsMap.get(userId)!;
      stats.totalRechargeAmount += amount;
      stats.totalRechargeCount += 1;

      // 更新首次付费时间
      if (!stats.firstPaidAt || firstPaidAt < stats.firstPaidAt) {
        stats.firstPaidAt = firstPaidAt;
      }
      // 更新首次上传凭证时间
      if (!stats.firstUploadAt || createdAt < stats.firstUploadAt) {
        stats.firstUploadAt = createdAt;
      }
    });

    // 获取用户详细信息
    const userIds = Array.from(userStatsMap.keys());
    let usersQuery = this.supabase
      .from('users')
      .select('*')
      .in('id', userIds);

    // 按次级管理员筛选
    if (secondaryAdmin) {
      usersQuery = usersQuery.eq('secondary_admin', secondaryAdmin);
    }

    const { data: users, error: usersError } = await usersQuery;

    if (usersError) {
      throw new BadRequestException('获取用户信息失败');
    }

    // 组合数据
    const paidUsers = (users || []).map(user => {
      const stats = userStatsMap.get(user.id)!;
      return {
        userId: user.id,
        username: user.username,
        role: user.role,
        isActive: user.is_active,
        secondaryAdmin: user.secondary_admin || undefined,
        firstPaidAt: stats.firstPaidAt, // 首次付费时间（如果有）
        firstUploadAt: stats.firstUploadAt, // 首次上传凭证的时间
        totalRechargeAmount: stats.totalRechargeAmount.toFixed(2),
        totalRechargeCount: stats.totalRechargeCount,
        createdAt: user.created_at,
      };
    });

    // 排序
    const sortColumn = sortBy === 'totalRechargeAmount' ? 'totalRechargeAmount' : sortBy;
    paidUsers.sort((a, b) => {
      const aVal = a[sortColumn as keyof PaidUserStats];
      const bVal = b[sortColumn as keyof PaidUserStats];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // 计算统计汇总
    const totalPaidUsers = paidUsers.length;
    const totalRechargeAmount = paidUsers.reduce((sum, user) => sum + parseFloat(user.totalRechargeAmount), 0).toFixed(2);

    // 计算时间范围内的新增付费用户数量和充值金额
    let newPaidUsersInPeriod = 0;
    let periodRechargeAmount = 0;

    if (startDate) {
      const startDateObj = new Date(`${startDate}T00:00:00Z`);
      paidUsers.forEach(user => {
        // 使用首次上传凭证的时间来判断是否在时间范围内
        if (new Date(user.firstUploadAt) >= startDateObj) {
          newPaidUsersInPeriod++;
          periodRechargeAmount += parseFloat(user.totalRechargeAmount);
        }
      });
    } else {
      newPaidUsersInPeriod = totalPaidUsers;
      periodRechargeAmount = parseFloat(totalRechargeAmount);
    }

    return {
      totalPaidUsers,
      newPaidUsersInPeriod,
      totalRechargeAmount,
      periodRechargeAmount: periodRechargeAmount.toFixed(2),
      users: paidUsers,
    };
  }

  /**
   * 获取免费用户列表（未上传付款凭证的用户）
   */
  async getFreeUsers(): Promise<UserInfo[]> {
    // 获取所有用户 ID
    const { data: allUsers, error: usersError } = await this.supabase
      .from('users')
      .select('id');

    if (usersError) {
      throw new BadRequestException('获取用户列表失败');
    }

    const allUserIds = allUsers?.map(u => u.id) || [];

    if (allUserIds.length === 0) {
      return [];
    }

    // 获取已上传付款凭证的用户 ID（screenshot_url IS NOT NULL）
    const { data: paidRecords, error: paidError } = await this.supabase
      .from('recharge_orders')
      .select('user_id')
      .not('screenshot_url', 'is', null);

    if (paidError) {
      throw new BadRequestException('获取付费记录失败');
    }

    const paidUserIds = new Set(paidRecords?.map(r => r.user_id) || []);

    // 筛选免费用户（未上传凭证的用户）
    const freeUserIds = allUserIds.filter(id => !paidUserIds.has(id));

    if (freeUserIds.length === 0) {
      return [];
    }

    // 获取免费用户详细信息
    const { data: freeUsers, error: freeUsersError } = await this.supabase
      .from('users')
      .select('*')
      .in('id', freeUserIds)
      .order('created_at', { ascending: false });

    if (freeUsersError) {
      throw new BadRequestException('获取免费用户信息失败');
    }

    return (freeUsers || []).map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
      isActive: user.is_active,
      secondaryAdmin: user.secondary_admin || undefined,
      createdAt: user.created_at,
      updatedAt: user.updated_at || undefined,
    }));
  }
}
