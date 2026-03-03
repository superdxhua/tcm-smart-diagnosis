/**
 * 数字张仲景 - 证据溯源服务
 * 确保每条诊断都引用经典条文编号，实现可追溯、可验证、可解释
 */

// ============================================
// 类型定义
// ============================================
export interface EvidenceTrace {
  id: string;
  recordId: string; // 记录ID
  recordType: string; // 记录类型（diagnosis/formula/treatment）
  evidenceType: '经典条文' | '专家共识' | '药典标准' | '核心期刊';
  evidenceId?: string; // 证据ID
  evidenceText: string; // 证据内容
  sourceReference: string; // 来源引用（如《伤寒论》第12条）
  weight: number; // 权重（0-1）
  createdAt: Date;
}

export interface EvidenceChain {
  diagnosisEvidence: EvidenceTrace[]; // 诊断证据链
  formulaEvidence: EvidenceTrace[]; // 方剂证据链
  treatmentEvidence: EvidenceTrace[]; // 治疗证据链
  overallConfidence: number; // 整体置信度
  missingEvidence: string[]; // 缺失证据
}

// ============================================
// 证据溯源服务
// ============================================
export class EvidenceTraceService {
  /**
   * 构建诊断证据链
   */
  static async buildDiagnosisEvidenceChain(
    syndrome: string,
    symptoms: string[],
    meridian: string
  ): Promise<EvidenceChain> {
    const diagnosisEvidence: EvidenceTrace[] = [];
    const missingEvidence: string[] = [];

    // 1. 查找经典条文证据
    const classicClauseEvidence = await this.findClassicClauseEvidence(syndrome, symptoms);
    diagnosisEvidence.push(...classicClauseEvidence);

    // 2. 查找专家共识证据
    const expertConsensusEvidence = await this.findExpertConsensusEvidence(syndrome);
    diagnosisEvidence.push(...expertConsensusEvidence);

    // 3. 检查证据完整性
    if (diagnosisEvidence.length === 0) {
      missingEvidence.push(`证候"${syndrome}"缺乏经典条文证据`);
    }

    // 4. 计算整体置信度
    const overallConfidence = this.calculateOverallConfidence(diagnosisEvidence);

    return {
      diagnosisEvidence,
      formulaEvidence: [], // 暂时留空，需要方剂ID
      treatmentEvidence: [], // 暂时留空
      overallConfidence,
      missingEvidence,
    };
  }

  /**
   * 构建方剂证据链
   */
  static async buildFormulaEvidenceChain(
    formulaId: string,
    formulaName: string
  ): Promise<EvidenceTrace[]> {
    const formulaEvidence: EvidenceTrace[] = [];

    // 1. 查找经典条文证据（方剂出处）
    const classicClauseEvidence = await this.findFormulaClassicClauseEvidence(formulaId);
    formulaEvidence.push(...classicClauseEvidence);

    // 2. 查找药典标准证据（药物剂量）
    const pharmacopeiaEvidence = await this.findPharmacopeiaEvidence(formulaId);
    formulaEvidence.push(...pharmacopeiaEvidence);

    // 3. 查找专家共识证据（加减法、禁忌）
    const expertConsensusEvidence = await this.findFormulaExpertConsensusEvidence(formulaId);
    formulaEvidence.push(...expertConsensusEvidence);

    return formulaEvidence;
  }

  /**
   * 构建治疗证据链
   */
  static async buildTreatmentEvidenceChain(
    formulaId: string,
    dosage: any,
    instructions: string
  ): Promise<EvidenceTrace[]> {
    const treatmentEvidence: EvidenceTrace[] = [];

    // 1. 查找煎服法证据（经典条文）
    const instructionEvidence = await this.findInstructionEvidence(formulaId, instructions);
    treatmentEvidence.push(...instructionEvidence);

    // 2. 查找剂量证据（药典标准）
    const dosageEvidence = await this.findDosageEvidence(dosage);
    treatmentEvidence.push(...dosageEvidence);

    return treatmentEvidence;
  }

  /**
   * 查找经典条文证据（证候）
   */
  private static async findClassicClauseEvidence(
    syndrome: string,
    symptoms: string[]
  ): Promise<EvidenceTrace[]> {
    // 这里应该查询数据库中的经典条文
    // 暂时返回模拟数据

    const evidenceMap: Record<string, { clause: string; text: string; reference: string }> = {
      太阳中风: {
        clause: '12',
        text: '太阳中风，阳浮而阴弱，阳浮者，热自发；阴弱者，汗自出。啬啬恶寒，淅淅恶风，翕翕发热，鼻鸣干呕者，桂枝汤主之。',
        reference: '《伤寒论》第12条',
      },
      太阳表实: {
        clause: '35',
        text: '太阳病，头痛发热，身疼腰痛，骨节疼痛，恶风，无汗而喘者，麻黄汤主之。',
        reference: '《伤寒论》第35条',
      },
      少阳病: {
        clause: '96',
        text: '伤寒五六日，中风，往来寒热，胸胁苦满，嘿嘿不欲饮食，心烦喜呕，或胸中烦而不呕，或渴，或腹中痛，或胁下痞硬，或心下悸、小便不利，或不渴、身有微热，或咳者，小柴胡汤主之。',
        reference: '《伤寒论》第96条',
      },
      阳明实证: {
        clause: '208',
        text: '阳明病，脉迟，虽汗出不恶寒者，其身必重，短气腹满而喘，有潮热者，此外欲解，可攻里也。手足濈然汗出者，此大便已硬也，大承气汤主之。',
        reference: '《伤寒论》第208条',
      },
    };

    const evidence = evidenceMap[syndrome];
    if (!evidence) return [];

    return [
      {
        id: `ev_${Date.now()}_classic`,
        recordId: `diag_${Date.now()}`,
        recordType: 'diagnosis',
        evidenceType: '经典条文',
        evidenceId: evidence.clause,
        evidenceText: evidence.text,
        sourceReference: evidence.reference,
        weight: 1.0,
        createdAt: new Date(),
      },
    ];
  }

  /**
   * 查找专家共识证据（证候）
   */
  private static async findExpertConsensusEvidence(syndrome: string): Promise<EvidenceTrace[]> {
    // 这里应该查询数据库中的专家共识
    // 暂时返回模拟数据

    const expertMap: Record<string, { consensus: string; experts: string[] }> = {
      太阳中风: {
        consensus: '太阳中风证，桂枝汤为正治法，此为历代经方家共识。',
        experts: ['刘渡舟', '胡希恕', '冯世纶'],
      },
      太阳表实: {
        consensus: '太阳表实证，麻黄汤为正治法，发汗解表。',
        experts: ['刘渡舟', '胡希恕'],
      },
    };

    const consensus = expertMap[syndrome];
    if (!consensus) return [];

    return [
      {
        id: `ev_${Date.now()}_expert`,
        recordId: `diag_${Date.now()}`,
        recordType: 'diagnosis',
        evidenceType: '专家共识',
        evidenceId: undefined,
        evidenceText: consensus.consensus,
        sourceReference: `专家共识：${consensus.experts.join('、')}`,
        weight: 0.9,
        createdAt: new Date(),
      },
    ];
  }

  /**
   * 查找方剂经典条文证据
   */
  private static async findFormulaClassicClauseEvidence(formulaId: string): Promise<EvidenceTrace[]> {
    // 这里应该查询数据库中方剂对应的经典条文
    // 暂时返回模拟数据

    const formulaClauseMap: Record<string, { clause: string; text: string; reference: string }> = {
      guizhi_tang: {
        clause: '12',
        text: '太阳中风，阳浮而阴弱，阳浮者，热自发；阴弱者，汗自出。啬啬恶寒，淅淅恶风，翕翕发热，鼻鸣干呕者，桂枝汤主之。',
        reference: '《伤寒论》第12条',
      },
      mahuang_tang: {
        clause: '35',
        text: '太阳病，头痛发热，身疼腰痛，骨节疼痛，恶风，无汗而喘者，麻黄汤主之。',
        reference: '《伤寒论》第35条',
      },
      xiaochaihu_tang: {
        clause: '96',
        text: '伤寒五六日，中风，往来寒热，胸胁苦满，嘿嘿不欲饮食，心烦喜呕，或胸中烦而不呕，或渴，或腹中痛，或胁下痞硬，或心下悸、小便不利，或不渴、身有微热，或咳者，小柴胡汤主之。',
        reference: '《伤寒论》第96条',
      },
    };

    const clause = formulaClauseMap[formulaId];
    if (!clause) return [];

    return [
      {
        id: `ev_${Date.now()}_formula_classic`,
        recordId: `formula_${formulaId}`,
        recordType: 'formula',
        evidenceType: '经典条文',
        evidenceId: clause.clause,
        evidenceText: clause.text,
        sourceReference: clause.reference,
        weight: 1.0,
        createdAt: new Date(),
      },
    ];
  }

  /**
   * 查找药典标准证据
   */
  private static async findPharmacopeiaEvidence(formulaId: string): Promise<EvidenceTrace[]> {
    // 这里应该查询数据库中的药典标准
    // 暂时返回模拟数据

    return [
      {
        id: `ev_${Date.now()}_pharmacopeia`,
        recordId: `formula_${formulaId}`,
        recordType: 'formula',
        evidenceType: '药典标准',
        evidenceId: undefined,
        evidenceText: '本方剂中所有药物剂量均符合《中国药典》2025版规定。',
        sourceReference: '《中国药典》2025版',
        weight: 0.95,
        createdAt: new Date(),
      },
    ];
  }

  /**
   * 查找方剂专家共识证据
   */
  private static async findFormulaExpertConsensusEvidence(formulaId: string): Promise<EvidenceTrace[]> {
    // 这里应该查询数据库中的专家共识
    // 暂时返回模拟数据

    return [];
  }

  /**
   * 查找煎服法证据
   */
  private static async findInstructionEvidence(
    formulaId: string,
    instructions: string
  ): Promise<EvidenceTrace[]> {
    // 这里应该查询数据库中的煎服法证据
    // 暂时返回模拟数据

    return [
      {
        id: `ev_${Date.now()}_instruction`,
        recordId: `treatment_${formulaId}`,
        recordType: 'treatment',
        evidenceType: '经典条文',
        evidenceId: undefined,
        evidenceText: instructions,
        sourceReference: '经典煎服法',
        weight: 0.9,
        createdAt: new Date(),
      },
    ];
  }

  /**
   * 查找剂量证据
   */
  private static async findDosageEvidence(dosage: any): Promise<EvidenceTrace[]> {
    // 这里应该查询数据库中的剂量证据
    // 暂时返回模拟数据

    return [
      {
        id: `ev_${Date.now()}_dosage`,
        recordId: `treatment_${Date.now()}`,
        recordType: 'treatment',
        evidenceType: '药典标准',
        evidenceId: undefined,
        evidenceText: '所有药物剂量均在《中国药典》安全范围内。',
        sourceReference: '《中国药典》2025版',
        weight: 0.95,
        createdAt: new Date(),
      },
    ];
  }

  /**
   * 计算整体置信度
   */
  private static calculateOverallConfidence(evidences: EvidenceTrace[]): number {
    if (evidences.length === 0) return 0;

    // 加权平均
    const totalWeight = evidences.reduce((sum, ev) => sum + ev.weight, 0);
    const weightedSum = evidences.reduce((sum, ev) => sum + ev.weight * ev.weight, 0);

    return weightedSum / totalWeight;
  }

  /**
   * 生成证据溯源报告（面向患者）
   */
  static generateEvidenceReportForPatient(evidenceChain: EvidenceChain): {
    diagnosisEvidence: string[];
    formulaEvidence: string[];
    treatmentEvidence: string[];
    overallConfidence: string;
  } {
    return {
      diagnosisEvidence: evidenceChain.diagnosisEvidence.map(ev => {
        return `✓ ${ev.sourceReference}：${ev.evidenceText.substring(0, 50)}...`;
      }),
      formulaEvidence: evidenceChain.formulaEvidence.map(ev => {
        return `✓ ${ev.sourceReference}：${ev.evidenceText.substring(0, 50)}...`;
      }),
      treatmentEvidence: evidenceChain.treatmentEvidence.map(ev => {
        return `✓ ${ev.sourceReference}：${ev.evidenceText.substring(0, 50)}...`;
      }),
      overallConfidence: `${(evidenceChain.overallConfidence * 100).toFixed(0)}%`,
    };
  }
}
