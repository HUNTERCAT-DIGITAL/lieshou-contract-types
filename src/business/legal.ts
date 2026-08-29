/**
 * Legal 类型（与 legal-service 实体对齐 · 法律行业能力域 ADR-0036）.
 *
 * 案件 + 办案时间线。isDeleted 后端 @JsonIgnore 不下发；此处不声明。
 */

export type CaseType = "CIVIL" | "CRIMINAL" | "ADMIN" | "COMMERCIAL" | "IP" | "OTHER";

export type CaseStatus = "INTAKE" | "FILED" | "IN_TRIAL" | "CLOSED" | "ARCHIVED";

/** 案件办理阶段（V35 八阶段主线 · 只前进不越级） */
export type CaseStage =
  | "CLIENT_MEETING"
  | "CASE_BRIEF"
  | "LEGAL_RESEARCH"
  | "STRATEGY_REPORT"
  | "CLIENT_PLAN"
  | "LEGAL_DOCS"
  | "TRIAL_PREP"
  | "FINAL_OUTCOME";

/** 案件关注度（共创版：高关注/需关注/稳健） */
export type CasePriority = "HIGH" | "MEDIUM" | "LOW";

export type EventType = "INTAKE" | "FILING" | "HEARING" | "EVIDENCE" | "MEDIATION" | "JUDGMENT" | "ARCHIVE" | "OTHER";

export type DocType = "CONTRACT" | "PLEADING" | "JUDGMENT" | "EVIDENCE" | "OPINION" | "MEMO" | "OTHER";

export type ExpenseType = "TRAVEL" | "COURT_FEE" | "PRESERVATION" | "NOTARIZATION" | "APPRAISAL" | "DELIVERY" | "OTHER";

export interface LegalCase {
  id: number;
  /** 归属租户（强制取 JWT tid，请求体不允许指定） */
  tenantId: number;
  caseNo: string;
  /** 内部案件编号 MAT-YYYY-XXXX（服务端生成） */
  matterNo?: string | null;
  title: string;
  caseType: CaseType;
  /** 当前办理阶段（8 阶段主线） */
  stage: CaseStage;
  /** 当前阶段进度 0-100 */
  stageProgress: number;
  /** 关注度 */
  priority: CasePriority;
  /** 数据密级（V36）：L1 公开 / L2 内部 / L3 团队 / L4 客户秘密 / L5 高度敏感 */
  dataClassification?: string | null;
  party?: string | null;
  oppositeParty?: string | null;
  court?: string | null;
  status: CaseStatus;
  responsibleLawyer?: string | null;
  coLawyer?: string | null;
  amount?: number | null;
  filedAt?: string | null;
  closedAt?: string | null;
  remark?: string | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CaseEvent {
  id: number;
  tenantId: number;
  caseId: number;
  eventType: EventType;
  /** ISO 时间（时间线排序依据） */
  occurredAt: string;
  title: string;
  detail?: string | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt: string;
  updatedAt?: string;
}

/** 创建案件（对应后端 CaseRequest；tenant 由后端强制取请求租户） */
export interface CreateCaseRequest {
  caseNo: string;
  title: string;
  caseType?: CaseType;
  stage?: CaseStage;
  stageProgress?: number;
  priority?: CasePriority;
  party?: string;
  oppositeParty?: string;
  court?: string;
  status?: CaseStatus;
  responsibleLawyer?: string;
  coLawyer?: string;
  amount?: number;
  filedAt?: string;
  closedAt?: string;
  remark?: string;
}

/** 编辑案件（对应后端 CaseRequest；status/stage 仅允许前进） */
export interface UpdateCaseRequest {
  caseNo: string;
  title: string;
  caseType?: CaseType;
  stage?: CaseStage;
  stageProgress?: number;
  priority?: CasePriority;
  party?: string;
  oppositeParty?: string;
  court?: string;
  status?: CaseStatus;
  responsibleLawyer?: string;
  coLawyer?: string;
  amount?: number;
  filedAt?: string;
  closedAt?: string;
  remark?: string;
}

/** 时间线事件请求 */
export interface CaseEventRequest {
  eventType: EventType;
  occurredAt: string;
  title: string;
  detail?: string;
}

/** 卷宗文书（ADR-0045 Phase 2） */
export interface LegalDocument {
  id: number;
  tenantId: number;
  caseId: number;
  docType: DocType;
  title: string;
  content?: string | null;
  /** 附件引用（预留 core.file 接入位；可为外部 URL） */
  fileUrl?: string | null;
  docDate?: string | null;
  createdBy?: number | null;
  createdAt: string;
}

/** 卷宗文书请求 */
export interface DocumentRequest {
  title: string;
  docType?: DocType;
  content?: string;
  fileUrl?: string;
  docDate?: string;
}

/** 案件工时记录（计时计费 · ADR-0045 Phase 2） */
export interface TimeEntry {
  id: number;
  tenantId: number;
  caseId: number;
  lawyer: string;
  workDate: string;
  /** 工时（小时） */
  hours: number;
  /** 费率（元/小时） */
  rate: number;
  /** 费用 = hours × rate（服务端计算） */
  amount: number;
  description?: string | null;
  /** 律时状态：PENDING 待确认 / CONFIRMED 已确认 */
  status: TimeEntryStatus;
  /** 确认人 */
  confirmedBy?: number | null;
  /** 确认时间 */
  confirmedAt?: string;
  createdBy?: number | null;
  createdAt: string;
}

/** 律时状态（待确认流程：记录 → 待确认 → 已确认） */
export type TimeEntryStatus = "PENDING" | "CONFIRMED";

export const TIME_ENTRY_STATUS_META: Record<TimeEntryStatus, { text: string; color: string }> = {
  PENDING: { text: "待确认", color: "orange" },
  CONFIRMED: { text: "已确认", color: "green" },
};

/** 工时记录请求 */
export interface TimeEntryRequest {
  lawyer: string;
  workDate: string;
  hours: number;
  rate: number;
  description?: string;
}

/** 案件计费汇总（/summary） */
export interface TimeEntrySummary {
  hours: number;
  amount: number;
  count: number;
  /** 待确认笔数（律时） */
  pendingCount: number;
}

/** 费用条目（实际支出 · ADR-0045 Phase 2 扩展） */
export interface Expense {
  id: number;
  tenantId: number;
  caseId: number;
  expenseType: ExpenseType;
  description: string;
  amount: number;
  expenseDate: string;
  createdBy?: number | null;
  createdAt: string;
}

/** 费用条目请求 */
export interface ExpenseRequest {
  description: string;
  expenseType?: ExpenseType;
  amount: number;
  expenseDate: string;
}

/** 费用汇总（/summary） */
export interface ExpenseSummary {
  amount: number;
  count: number;
}

/** 列表分页响应结构（后端 /list 统一返回 {items,total,page,size}） */
export interface LegalPage<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

/** 工作台聚合统计（GET /api/legal/workbench/summary · TODAY COMMAND 今日作战台） */
export interface WorkbenchSummary {
  /** 案件状态分布（INTAKE/FILED/IN_TRIAL/CLOSED/ARCHIVED → 数量） */
  statusCounts: Record<CaseStatus, number>;
  /** 在办案件数（INTAKE + FILED + IN_TRIAL） */
  activeCount: number;
  /** 已结案 + 已归档数 */
  closedCount: number;
  /** 在办且高关注案件数（TODAY 待办） */
  highPriorityCount: number;
  /** 本月律时（小时） */
  monthlyHours: number;
  /** 本月律时金额（元） */
  monthlyAmount: number;
  /** 本月律时条数 */
  monthlyTimeCount: number;
  /** 本月待确认律时条数（律时 · 待确认归属） */
  pendingTimeCount: number;
  /** 卷宗文书总数（知识资产） */
  documentCount: number;
  /** 立项闸门未全部通过的案件数（接洽待完善） */
  unpassedIntakeCases: number;
  /** 待确认联系函数（客户成功 · 愿景「X 项待确认」） */
  pendingLetters: number;
  /** 知识卡总数（知识资产） */
  knowledgeTotal: number;
  /** 候选待复核（DRAFT + PENDING_REVIEW） */
  knowledgeCandidates: number;
  /** 待专业复核（PENDING_REVIEW） */
  knowledgeReviewPending: number;
  /** 专业成长指数（工作台 06 卡） */
  growthIndex?: number;
  /** 组合健康度（客户成功中心 · 服务中客户健康分均值） */
  clientSuccessScore?: number;
  /** 客户总数（客户成功中心） */
  clientTotal?: number;
  /** 待跟进客户数（高关注 + 跟进 + 待办） */
  clientFollowUp?: number;
  /** 高关注客户数 */
  clientHighAttention?: number;
}

/** 最近工作项（断点续作 · GET /api/legal/workbench/recent） */
export interface RecentWorkItem {
  /** document 文书 / time 律时 / letter 联系函 / event 事件 / case 案件 */
  kind: "document" | "time" | "letter" | "event" | "case";
  id: number;
  caseId: number;
  caseTitle: string;
  matterNo?: string | null;
  title: string;
  at: string;
}

// ============================================================
// 知识资产中心（KNOWLEDGE ASSETS · 经验候选→专业复核→脱敏复用）
// ============================================================

export type KnowledgeCardType =
  | "RULE"
  | "EVIDENCE"
  | "LESSON"
  | "DRAFTING"
  | "COMMUNICATION"
  | "DELIVERY"
  | "STRATEGY"
  | "EXPERIENCE";

export type KnowledgeCardStatus = "DRAFT" | "PENDING_REVIEW" | "REVIEWED" | "PUBLISHED" | "REJECTED";

export interface KnowledgeCard {
  id: number;
  tenantId: number;
  cardType: KnowledgeCardType;
  title: string;
  content?: string | null;
  status: KnowledgeCardStatus;
  /** 来源案件（可空 = 平台知识） */
  caseId?: number | null;
  /** 内部受限（失败教训卡默认 true，不可复用） */
  confidential: boolean;
  reviewedBy?: number | null;
  reviewedAt?: string;
  usageCount: number;
  createdBy?: number | null;
  createdAt: string;
}

export interface KnowledgeCardRequest {
  cardType: KnowledgeCardType;
  title: string;
  content?: string;
  caseId?: number;
  confidential?: boolean;
}

export interface KnowledgeSummary {
  total: number;
  candidateCount: number;
  reviewPendingCount: number;
}

/** 六维成长维度（专业成长中心 · 与 GrowthController 六维 key 对齐） */
export interface GrowthDimension {
  key: string;
  name: string;
  score: number;
  basis: string;
}

export interface GrowthSummary {
  /** 综合成长指数（六维平均 0-100） */
  growthIndex: number;
  /** 本月新增工作证据条数 */
  monthEvidence: number;
  /** 待确认事项数（律时待确认 + 联系函待确认 + 知识卡候选） */
  pendingConfirm: number;
  /** 成长重点（最低分维度名） */
  focus: string;
  dimensions: GrowthDimension[];
  coach: {
    focus: string;
    advice: string;
    steps: string[];
  };
}

export const KNOWLEDGE_TYPE_META: Record<KnowledgeCardType, { text: string; color: string }> = {
  RULE: { text: "裁判规则", color: "geekblue" },
  EVIDENCE: { text: "证据策略", color: "cyan" },
  LESSON: { text: "失败教训", color: "volcano" },
  DRAFTING: { text: "文书表达", color: "purple" },
  COMMUNICATION: { text: "客户沟通", color: "blue" },
  DELIVERY: { text: "产品交付", color: "green" },
  STRATEGY: { text: "策略", color: "gold" },
  EXPERIENCE: { text: "经验", color: "default" },
};

export const KNOWLEDGE_STATUS_META: Record<KnowledgeCardStatus, { text: string; color: string }> = {
  DRAFT: { text: "经验候选", color: "default" },
  PENDING_REVIEW: { text: "待复核", color: "orange" },
  REVIEWED: { text: "已复核", color: "processing" },
  PUBLISHED: { text: "可复用", color: "success" },
  REJECTED: { text: "已驳回", color: "error" },
};

/** 案件状态元数据（文本 + 颜色，对齐 @lieshoucloud/ui StatusTag） */
export const CASE_STATUS_META: Record<CaseStatus, { text: string; color: string }> = {
  INTAKE: { text: "待立案", color: "default" },
  FILED: { text: "已立案", color: "processing" },
  IN_TRIAL: { text: "审理中", color: "warning" },
  CLOSED: { text: "已结案", color: "success" },
  ARCHIVED: { text: "已归档", color: "default" },
};

export const CASE_STAGE_META: Record<CaseStage, { text: string; color: string }> = {
  CLIENT_MEETING: { text: "01 客户接洽", color: "blue" },
  CASE_BRIEF: { text: "02 案情简报", color: "cyan" },
  LEGAL_RESEARCH: { text: "03 法律检索", color: "geekblue" },
  STRATEGY_REPORT: { text: "04 策略分析报告", color: "gold" },
  CLIENT_PLAN: { text: "05 客户服务方案", color: "purple" },
  LEGAL_DOCS: { text: "06 法律文书", color: "magenta" },
  TRIAL_PREP: { text: "07 庭审/谈判提纲", color: "volcano" },
  FINAL_OUTCOME: { text: "08 最终成果", color: "green" },
};

export const CASE_PRIORITY_META: Record<CasePriority, { text: string; color: string }> = {
  HIGH: { text: "高关注", color: "red" },
  MEDIUM: { text: "需关注", color: "orange" },
  LOW: { text: "稳健", color: "default" },
};

export const CASE_TYPE_META: Record<CaseType, string> = {
  CIVIL: "民事",
  CRIMINAL: "刑事",
  ADMIN: "行政",
  COMMERCIAL: "商事仲裁",
  IP: "知识产权",
  OTHER: "其他",
};

export const EVENT_TYPE_META: Record<EventType, { text: string; color: string }> = {
  INTAKE: { text: "委托收案", color: "blue" },
  FILING: { text: "立案", color: "cyan" },
  HEARING: { text: "开庭", color: "gold" },
  EVIDENCE: { text: "举证", color: "geekblue" },
  MEDIATION: { text: "调解", color: "purple" },
  JUDGMENT: { text: "判决", color: "green" },
  ARCHIVE: { text: "归档", color: "default" },
  OTHER: { text: "其他", color: "default" },
};

export const DOC_TYPE_META: Record<DocType, { text: string; color: string }> = {
  CONTRACT: { text: "委托合同", color: "blue" },
  PLEADING: { text: "诉状", color: "cyan" },
  JUDGMENT: { text: "判决书", color: "green" },
  EVIDENCE: { text: "证据材料", color: "geekblue" },
  OPINION: { text: "法律意见书", color: "purple" },
  MEMO: { text: "备忘录", color: "default" },
  OTHER: { text: "其他", color: "default" },
};

export const EXPENSE_TYPE_META: Record<ExpenseType, { text: string; color: string }> = {
  TRAVEL: { text: "差旅费", color: "blue" },
  COURT_FEE: { text: "诉讼费", color: "gold" },
  PRESERVATION: { text: "保全费", color: "cyan" },
  NOTARIZATION: { text: "公证费", color: "purple" },
  APPRAISAL: { text: "鉴定费", color: "geekblue" },
  DELIVERY: { text: "邮寄费", color: "default" },
  OTHER: { text: "其他", color: "default" },
};

/** 八阶段办理主线（V35 LINK & CROSS · MATTER METHOD）——程序树数据源 */
export interface CaseStageFlow {
  key: CaseStage;
  /** 阶段序号文本 */
  no: string;
  /** 阶段名 */
  name: string;
  /** 主责角色（V35） */
  role: string;
  /** 产出物（V35） */
  outputs: string[];
}

export const CASE_STAGE_FLOW: CaseStageFlow[] = [
  {
    key: "CLIENT_MEETING",
    no: "01",
    name: "客户接洽",
    role: "案源律师",
    outputs: ["接洽纪要", "需求清单", "授权边界"],
  },
  {
    key: "CASE_BRIEF",
    no: "02",
    name: "案情简报",
    role: "助理律师",
    outputs: ["案情简报 V3", "主体与事实初表"],
  },
  {
    key: "LEGAL_RESEARCH",
    no: "03",
    name: "法律检索 + 案例检索报告",
    role: "助理律师",
    outputs: ["法律检索报告", "案例检索报告"],
  },
  {
    key: "STRATEGY_REPORT",
    no: "04",
    name: "策略分析报告",
    role: "主办律师",
    outputs: ["策略分析报告", "情景预案"],
  },
  {
    key: "CLIENT_PLAN",
    no: "05",
    name: "客户服务方案",
    role: "案源律师",
    outputs: ["服务范围", "团队分工", "报价与里程碑"],
  },
  {
    key: "LEGAL_DOCS",
    no: "06",
    name: "法律文书",
    role: "协办律师",
    outputs: ["诉状 / 答辩 / 申请 / 函件"],
  },
  {
    key: "TRIAL_PREP",
    no: "07",
    name: "庭审提纲 + 谈判提纲",
    role: "主办律师",
    outputs: ["庭审提纲", "质证意见", "谈判脚本"],
  },
  {
    key: "FINAL_OUTCOME",
    no: "08",
    name: "裁判文书 + 商务合同 + 法律意见书",
    role: "主办律师",
    outputs: ["按事项类型形成最终成果与结案报告"],
  },
];

/** 当前 stage 的流程序号（用于程序树状态计算） */
export function stageIndex(stage: CaseStage): number {
  return CASE_STAGE_FLOW.findIndex((f) => f.key === stage);
}

// ============================================================
// 案件闸门（V35 可信业务链 · 立项四闸门 + 结案四闸门）
// ============================================================

export type GateType =
  | "CONFLICT_CHECK"
  | "IDENTITY_AUTH"
  | "ENGAGEMENT_FEE"
  | "DATA_CLASS"
  | "OUTCOME_CONFIRM"
  | "EXPENSE_SETTLE"
  | "ARCHIVE_COMPLETE"
  | "REVIEW_GOVERN";

export type GateStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

export interface Gate {
  id: number;
  tenantId: number;
  caseId: number;
  gateType: GateType;
  status: GateStatus;
  note?: string | null;
  updatedBy?: number | null;
  updatedAt?: string;
}

export const GATE_TYPE_META: Record<GateType, { text: string; phase: "intake" | "close"; desc: string }> = {
  CONFLICT_CHECK: { text: "利益冲突核验", phase: "intake", desc: "客户、对方及关联主体已检索" },
  IDENTITY_AUTH: { text: "身份与授权", phase: "intake", desc: "授权范围已确认" },
  ENGAGEMENT_FEE: { text: "委托与费用", phase: "intake", desc: "服务范围、报价及里程碑已锁定" },
  DATA_CLASS: { text: "数据与密级", phase: "intake", desc: "L4 CLIENT CONFIDENTIAL" },
  OUTCOME_CONFIRM: { text: "成果与客户确认", phase: "close", desc: "正式成果、回执与后续行动" },
  EXPENSE_SETTLE: { text: "费用与第三方支出", phase: "close", desc: "确认工时、预算、开票与回款" },
  ARCHIVE_COMPLETE: { text: "案卷完整性", phase: "close", desc: "材料、版本、沟通与送达记录" },
  REVIEW_GOVERN: { text: "复盘与知识治理", phase: "close", desc: "脱敏、专业审核与复用授权" },
};

export const GATE_STATUS_META: Record<GateStatus, { text: string; color: string }> = {
  PENDING: { text: "待办", color: "default" },
  IN_PROGRESS: { text: "进行中", color: "processing" },
  COMPLETED: { text: "已通过", color: "success" },
  FAILED: { text: "未通过", color: "error" },
};

export const DATA_CLASS_META: Record<string, { text: string; color: string }> = {
  L1: { text: "L1 公开", color: "default" },
  L2: { text: "L2 律所内部", color: "blue" },
  L3: { text: "L3 案件团队", color: "cyan" },
  L4: { text: "L4 客户秘密", color: "volcano" },
  L5: { text: "L5 高度敏感", color: "red" },
};

// ============================================================
// 联系函（客户沟通 CLIENT COMMUNICATION · 愿景「1 封联系函 · 2 项待确认」）
// ============================================================

export type LetterDirection = "OUTBOUND" | "INBOUND";
export type LetterStatus = "PENDING" | "CONFIRMED" | "ARCHIVED";

export interface ContactLetter {
  id: number;
  tenantId: number;
  caseId: number;
  /** OUTBOUND 去函（律所→客户）/ INBOUND 来函（客户→律所） */
  direction: LetterDirection;
  subject: string;
  content?: string | null;
  /** PENDING 待确认 / CONFIRMED 已确认 / ARCHIVED 已归档 */
  status: LetterStatus;
  sender?: string | null;
  recipient?: string | null;
  letterDate: string;
  confirmedAt?: string;
  createdBy?: number | null;
  createdAt: string;
}

export interface LetterRequest {
  direction: LetterDirection;
  subject: string;
  content?: string;
  sender?: string;
  recipient?: string;
  letterDate: string;
}

/** 联系函汇总（/summary） */
export interface LetterSummary {
  count: number;
  pendingCount: number;
}

export const LETTER_DIRECTION_META: Record<LetterDirection, { text: string; color: string }> = {
  OUTBOUND: { text: "去函", color: "blue" },
  INBOUND: { text: "来函", color: "cyan" },
};

export const LETTER_STATUS_META: Record<LetterStatus, { text: string; color: string }> = {
  PENDING: { text: "待确认", color: "orange" },
  CONFIRMED: { text: "已确认", color: "green" },
  ARCHIVED: { text: "已归档", color: "default" },
};

// ============================================================
// 客户成功中心（CLIENT SUCCESS CENTER · 愿景附录四）
// ============================================================

export type ClientLifecycleStage =
  | "VISITOR"
  | "LEAD"
  | "TRIAGE"
  | "DIAGNOSIS"
  | "PRODUCT"
  | "ENGAGED"
  | "SERVING"
  | "CLOSED"
  | "REPEAT"
  | "REFERRAL";

export type ClientStatus = "HIGH_ATTENTION" | "HEALTHY" | "FOLLOW_UP" | "OPPORTUNITY" | "TODO";

export type ClientValueType = "RISK_ALERT" | "DECISION_SUPPORT" | "OUTCOME_ADOPTED";

export interface LegalClient {
  id: number;
  tenantId: number;
  name: string;
  lifecycleStage: ClientLifecycleStage;
  currentService?: string | null;
  healthScore: number;
  responseScore?: number | null;
  communicationScore?: number | null;
  todoScore?: number | null;
  stabilityScore?: number | null;
  status: ClientStatus;
  note?: string | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientValueRecord {
  id: number;
  tenantId: number;
  clientId: number;
  valueType: ClientValueType;
  description: string;
  confirmed: boolean;
  createdBy?: number | null;
  createdAt: string;
}

export interface ClientRequest {
  name: string;
  lifecycleStage: ClientLifecycleStage;
  currentService?: string;
  responseScore?: number;
  communicationScore?: number;
  todoScore?: number;
  stabilityScore?: number;
  status?: ClientStatus;
  note?: string;
}

/** 客户成功汇总（/clients/summary） */
export interface ClientSuccessSummary {
  /** 生命周期漏斗（10 阶段计数） */
  funnel: Record<ClientLifecycleStage, number>;
  clientTotal: number;
  /** 组合健康度（服务中客户健康分均值） */
  portfolioHealth: number;
  followUpCount: number;
  highAttentionCount: number;
  /** 组合健康四维（HEALTH MODEL） */
  healthDimensions: Record<"response" | "communication" | "todo" | "stability", number>;
  valueConfirmed: number;
  valuePending: number;
  valueConfirmedByType: Record<ClientValueType, number>;
}

export const CLIENT_STAGE_META: Record<ClientLifecycleStage, { text: string; color: string }> = {
  VISITOR: { text: "陌生访客", color: "default" },
  LEAD: { text: "线索", color: "blue" },
  TRIAGE: { text: "分诊客户", color: "cyan" },
  DIAGNOSIS: { text: "诊断客户", color: "geekblue" },
  PRODUCT: { text: "产品客户", color: "purple" },
  ENGAGED: { text: "委托客户", color: "gold" },
  SERVING: { text: "服务中客户", color: "green" },
  CLOSED: { text: "已结案客户", color: "default" },
  REPEAT: { text: "复购客户", color: "magenta" },
  REFERRAL: { text: "转介绍客户", color: "volcano" },
};

export const CLIENT_STATUS_META: Record<ClientStatus, { text: string; color: string }> = {
  HIGH_ATTENTION: { text: "高关注", color: "red" },
  HEALTHY: { text: "健康", color: "green" },
  FOLLOW_UP: { text: "跟进", color: "orange" },
  OPPORTUNITY: { text: "机会", color: "gold" },
  TODO: { text: "待办", color: "default" },
};

export const CLIENT_VALUE_META: Record<ClientValueType, { text: string; color: string }> = {
  RISK_ALERT: { text: "风险提前提示", color: "red" },
  DECISION_SUPPORT: { text: "决策支持", color: "blue" },
  OUTCOME_ADOPTED: { text: "成果实际采用", color: "green" },
};

/** 健康分色阶（<60 红 / 60-79 橙 / ≥80 绿） */
export function healthTone(score: number): "red" | "orange" | "green" {
  if (score < 60) return "red";
  if (score < 80) return "orange";
  return "green";
}

export const CLIENT_STAGE_OPTIONS: { value: ClientLifecycleStage; label: string }[] = (
  Object.keys(CLIENT_STAGE_META) as ClientLifecycleStage[]
).map((s) => ({ value: s, label: CLIENT_STAGE_META[s].text }));

export const CLIENT_STATUS_OPTIONS: { value: ClientStatus; label: string }[] = (
  Object.keys(CLIENT_STATUS_META) as ClientStatus[]
).map((s) => ({ value: s, label: CLIENT_STATUS_META[s].text }));

// ============================================================
// 任务与日程（MATTER CALENDAR · 愿景附录五）
// ============================================================

export type ScheduleType = "NODE_TASK" | "REVIEW" | "CLIENT_MEETING" | "TEAM_MEETING";
export type ScheduleResponsibility = "PRIMARY" | "COORDINATE" | "CLIENT_COMM" | "JUDGMENT" | "REVIEW" | "RESOURCE";

export interface MatterSchedule {
  id: number;
  tenantId: number;
  caseId?: number | null;
  title: string;
  scheduleDate: string;
  startMinute: number;
  durationMinutes: number;
  scheduleType: ScheduleType;
  responsibility: ScheduleResponsibility;
  confirmed: boolean;
  conflictNote?: string | null;
  createdAt: string;
  caseMatterNo?: string | null;
  caseTitle?: string | null;
  caseStage?: string | null;
}

export interface ScheduleRequest {
  title: string;
  caseId?: number;
  scheduleDate: string;
  startMinute?: number;
  durationMinutes?: number;
  scheduleType?: ScheduleType;
  responsibility?: ScheduleResponsibility;
  confirmed?: boolean;
}

/** 冲突（同日期时间重叠） */
export interface ScheduleConflict {
  date: string;
  a: MatterSchedule;
  b: MatterSchedule;
  overlapMinutes: number;
}

/** 按案件聚合投入（MATTER CAPACITY） */
export interface ScheduleCapacity {
  caseId: number;
  matterNo: string;
  caseTitle: string;
  minutes: number;
}

/** 任务与日程汇总（/schedules/summary） */
export interface MatterCalendarSummary {
  workCount: number;
  estimatedMinutes: number;
  meetingCount: number;
  pendingConfirm: number;
  conflicts: ScheduleConflict[];
  capacity: Record<string, ScheduleCapacity>;
}

export const SCHEDULE_TYPE_META: Record<ScheduleType, { text: string; color: string }> = {
  NODE_TASK: { text: "节点任务", color: "blue" },
  REVIEW: { text: "专业复核", color: "gold" },
  CLIENT_MEETING: { text: "客户沟通", color: "green" },
  TEAM_MEETING: { text: "协同会议", color: "purple" },
};

export const SCHEDULE_RESPONSIBILITY_META: Record<ScheduleResponsibility, { text: string; color: string }> = {
  PRIMARY: { text: "主责", color: "red" },
  COORDINATE: { text: "协同", color: "blue" },
  CLIENT_COMM: { text: "客户沟通", color: "green" },
  JUDGMENT: { text: "专业判断", color: "gold" },
  REVIEW: { text: "复核", color: "orange" },
  RESOURCE: { text: "协调", color: "cyan" },
};

export const SCHEDULE_TYPE_OPTIONS: { value: ScheduleType; label: string }[] = (
  Object.keys(SCHEDULE_TYPE_META) as ScheduleType[]
).map((t) => ({ value: t, label: SCHEDULE_TYPE_META[t].text }));

export const SCHEDULE_RESPONSIBILITY_OPTIONS: { value: ScheduleResponsibility; label: string }[] = (
  Object.keys(SCHEDULE_RESPONSIBILITY_META) as ScheduleResponsibility[]
).map((r) => ({
  value: r,
  label: SCHEDULE_RESPONSIBILITY_META[r].text,
}));

/** 分钟 → HH:mm（570 → 09:30） */
export function minuteToTime(minute: number): string {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** 星期文案（Date.getDay() 0-6 → 日一二三四五六） */
export const WEEKDAY_TEXT = ["日", "一", "二", "三", "四", "五", "六"];

export function formatDateCN(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  const w = WEEKDAY_TEXT[d.getDay()];
  return `${iso} 周${w}`;
}

// ============================================================
// 组织赋能驾驶舱（ENABLEMENT · 愿景附录三）
// ============================================================

export type OrgSignalType = "LOAD" | "REVIEW_BACKLOG" | "GROWTH_OPPORTUNITY" | "CLIENT_SUPPORT";
export type OrgActionType = "SUGGESTION" | "ASSISTANCE";

export interface TeamMember {
  id: number;
  tenantId: number;
  name: string;
  role: string;
  loadPercent: number;
  growthScore: number;
  growthDelta: number;
  opportunity?: string | null;
  createdAt: string;
}

export interface OrgSignal {
  id: number;
  tenantId: number;
  signalType: OrgSignalType;
  label: string;
  countValue: number;
  disposition?: string | null;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  createdAt: string;
}

export interface OrgBoard {
  id: number;
  tenantId: number;
  boardKey: "TALENT" | "PEOPLE" | "FINANCE" | "BRAND" | "MARKET";
  label: string;
  metricLabel: string;
  metricValue: string;
  detail?: string | null;
  status: string;
}

export interface OrgAction {
  id: number;
  tenantId: number;
  actionType: OrgActionType;
  title: string;
  detail?: string | null;
  owner?: string | null;
  status: "PENDING" | "DONE";
  createdAt: string;
}

export interface CareerMilestone {
  id: number;
  tenantId: number;
  goal: string;
  readiness: number;
  advice?: string | null;
  status: string;
}

export interface EnablementSummary {
  signals: OrgSignal[];
  pendingSignals: number;
  boards: OrgBoard[];
  members: TeamMember[];
  actions: OrgAction[];
  pendingActions: number;
  milestones: CareerMilestone[];
  backboneActive: number;
}

export const ORG_SIGNAL_META: Record<OrgSignalType, { text: string; color: string; icon: string }> = {
  LOAD: { text: "负荷需要调节", color: "red", icon: "⚖️" },
  REVIEW_BACKLOG: { text: "专业复核拥堵", color: "orange", icon: "🗂️" },
  GROWTH_OPPORTUNITY: { text: "成长机会待配置", color: "blue", icon: "🌱" },
  CLIENT_SUPPORT: { text: "客户支持需升级", color: "green", icon: "🤝" },
};

export const ORG_ACTION_META: Record<OrgActionType, { text: string; color: string }> = {
  SUGGESTION: { text: "律时建议", color: "blue" },
  ASSISTANCE: { text: "管理帮助", color: "gold" },
};

export const ORG_BOARD_META: Record<string, { text: string }> = {
  TALENT: { text: "TALENT 招聘" },
  PEOPLE: { text: "PEOPLE 人力" },
  FINANCE: { text: "FINANCE 财务" },
  BRAND: { text: "BRAND 品牌行政" },
  MARKET: { text: "MARKET 市场" },
};

// ============================================================
// 质量关口与治理（GOVERNANCE · 愿景附录九）
// ============================================================

export type GovernanceCategory = "CONFLICT" | "CONTENT" | "PERMISSION" | "DATA_ACCESS" | "COMPLIANCE";
export type GovernanceStatus = "PENDING" | "IN_PROGRESS" | "DONE";

export interface GovernanceItem {
  id: number;
  tenantId: number;
  title: string;
  category: GovernanceCategory;
  severity: "HIGH" | "MEDIUM" | "LOW";
  status: GovernanceStatus;
  note?: string | null;
  createdAt: string;
}

export interface AuditEvent {
  id: number;
  tenantId: number;
  eventType: string;
  content: string;
  eventStatus: string;
  actor?: string | null;
  occurredAt: string;
}

export interface GovernanceRule {
  id: number;
  tenantId: number;
  name: string;
  description?: string | null;
  enabled: boolean;
  createdAt: string;
}

export interface GovernanceSummary {
  items: GovernanceItem[];
  openCount: number;
  dataAccess: { approved: number; pending: number; blocked: number };
  auditEvents: AuditEvent[];
  rules: GovernanceRule[];
  backbone: { no: string; name: string; point: string; tag: string }[];
  dataClasses: { level: string; name: string; desc: string }[];
  boundaries: string[];
  allSystemsNormal: boolean;
}

export const GOV_CATEGORY_META: Record<GovernanceCategory, { text: string; color: string }> = {
  CONFLICT: { text: "利益冲突", color: "red" },
  CONTENT: { text: "内容审查", color: "orange" },
  PERMISSION: { text: "权限申请", color: "blue" },
  DATA_ACCESS: { text: "敏感数据", color: "purple" },
  COMPLIANCE: { text: "合规事项", color: "default" },
};

export const GOV_STATUS_META: Record<GovernanceStatus, { text: string; color: string }> = {
  PENDING: { text: "待处理", color: "orange" },
  IN_PROGRESS: { text: "处理中", color: "processing" },
  DONE: { text: "已完成", color: "success" },
};

export const GOV_SEVERITY_META: Record<"HIGH" | "MEDIUM" | "LOW", { text: string; color: string }> = {
  HIGH: { text: "高", color: "red" },
  MEDIUM: { text: "中", color: "orange" },
  LOW: { text: "低", color: "default" },
};

export const GOV_CATEGORY_OPTIONS: { value: GovernanceCategory; label: string }[] = (
  Object.keys(GOV_CATEGORY_META) as GovernanceCategory[]
).map((c) => ({ value: c, label: GOV_CATEGORY_META[c].text }));

// ============================================================
// 分工授权（五角色协同 · 阶段级动态分工 · ADR-0045）
// ============================================================
export type AssignmentStatus = "ASSIGNED" | "IN_PROGRESS" | "REVIEWING" | "COMPLETED";

export interface CaseAssignment {
  id: number;
  tenantId: number;
  caseId: number;
  /** 案件阶段（如 STRATEGY_REPORT） */
  stageCode: string;
  /** 任务类型（如 策略分析 / 文书起草 / 检索报告） */
  taskType: string;
  ownerUserId: number;
  reviewerUserId?: number | null;
  status: AssignmentStatus;
  assignedAt?: string;
  assignedBy?: number | null;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentRequest {
  stageCode: string;
  taskType: string;
  ownerUserId: number;
  reviewerUserId?: number | null;
  status?: AssignmentStatus;
}

export const ASSIGNMENT_STATUS_META: Record<AssignmentStatus, { text: string; color: string }> = {
  ASSIGNED: { text: "已指派", color: "blue" },
  IN_PROGRESS: { text: "进行中", color: "processing" },
  REVIEWING: { text: "复核中", color: "gold" },
  COMPLETED: { text: "已完成", color: "success" },
};

// ============================================================
// 案件席位（五角色协同 · 5 席 × 每案 · 一人可兼多席）
// ============================================================
export type SeatCode = "CASE_SOURCE" | "LEAD" | "ASSOCIATE" | "ASSISTANT" | "SECRETARY";

export interface CaseRole {
  id: number;
  tenantId: number;
  caseId: number;
  seatCode: SeatCode;
  memberUserId: number;
  grantedAt?: string;
  grantedBy?: number | null;
  revokedAt?: string | null;
  revokedBy?: number | null;
}

export interface CaseRoleRequest {
  seatCode: SeatCode;
  memberUserId: number;
}

export const SEAT_META: Record<SeatCode, { text: string; color: string }> = {
  CASE_SOURCE: { text: "案源律师", color: "cyan" },
  LEAD: { text: "主办律师", color: "geekblue" },
  ASSOCIATE: { text: "协办律师", color: "blue" },
  ASSISTANT: { text: "助理律师", color: "purple" },
  SECRETARY: { text: "法律秘书", color: "default" },
};

// ============================================================
// 知识流（办案经验沉淀 → 知识卡 · ADR-0045）
// ============================================================
export type FlowKind = "STRATEGY_CARD" | "DOC_EXPR_CARD" | "EXPERIENCE_CARD";
export type FlowStatus = "CANDIDATE" | "REVIEWED" | "ANONYMIZED" | "REUSABLE";

export interface KnowledgeFlow {
  id: number;
  tenantId: number;
  caseId: number;
  kind: FlowKind;
  title: string;
  content: string;
  status: FlowStatus;
  reviewerUserId?: number | null;
  reviewedAt?: string | null;
  isPrivate?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface KnowledgeFlowRequest {
  caseId: number;
  kind: FlowKind;
  title: string;
  content: string;
  isPrivate?: boolean;
}

export interface KnowledgeFlowAdvanceRequest {
  status: FlowStatus;
}

export const FLOW_KIND_META: Record<FlowKind, { text: string }> = {
  STRATEGY_CARD: { text: "策略卡" },
  DOC_EXPR_CARD: { text: "文书表达卡" },
  EXPERIENCE_CARD: { text: "办案经验卡" },
};

export const FLOW_STATUS_META: Record<FlowStatus, { text: string; color: string }> = {
  CANDIDATE: { text: "候选", color: "orange" },
  REVIEWED: { text: "已评审", color: "blue" },
  ANONYMIZED: { text: "已脱敏", color: "purple" },
  REUSABLE: { text: "可复用", color: "success" },
};

// ============================================================
// 台账（案件事实/证据/策略/任务 分型记录）
// ============================================================
export type LedgerType = "FACT" | "EVIDENCE" | "STRATEGY" | "TASK";
export type LedgerStatus = "CURRENT" | "CONFIRMED" | "PARTIAL_DISPUTED" | "PENDING_VERIFY";

export interface LedgerEntry {
  id: number;
  tenantId: number;
  caseId: number;
  ledgerType: LedgerType;
  title: string;
  detail: string;
  status: LedgerStatus;
  occurredAt?: string;
  sortSeq?: number;
  isPrivate?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LedgerRequest {
  title: string;
  detail: string;
  status?: LedgerStatus;
  occurredAt?: string;
  sortSeq?: number;
  isPrivate?: boolean;
}

export const LEDGER_TYPE_META: Record<LedgerType, { text: string; color: string }> = {
  FACT: { text: "事实", color: "blue" },
  EVIDENCE: { text: "证据", color: "green" },
  STRATEGY: { text: "策略", color: "purple" },
  TASK: { text: "任务", color: "orange" },
};

export const LEDGER_STATUS_META: Record<LedgerStatus, { text: string; color: string }> = {
  CURRENT: { text: "当前", color: "default" },
  CONFIRMED: { text: "已确认", color: "success" },
  PARTIAL_DISPUTED: { text: "部分存疑", color: "warning" },
  PENDING_VERIFY: { text: "待核验", color: "orange" },
};

// ============================================================
// AI 会话与建议（办案助手 · ADR-0045）
// ============================================================
export type AgentCode = "CASE_SECRETARY" | "TIME_DIGITAL" | "COMPLIANCE" | "RESEARCH";
export type AiLayer = "DRAFT" | "CASE" | "PENDING_CONFIRM" | "EXPERIENCE_CANDIDATE" | "REVIEW";
export type SuggestionKind =
  | "TIME_ATTRIBUTION"
  | "CONFLICT_HINT"
  | "KNOWLEDGE_CARD"
  | "DOC_DRAFT"
  | "SUMMARY";
export type SuggestionStatus = "PENDING" | "ACCEPTED" | "MODIFIED" | "REJECTED";

export interface AiSession {
  id: number;
  tenantId: number;
  caseId: number;
  agentCode: AgentCode;
  ownerUserId: number;
  layer: AiLayer;
  modelId?: string;
  policyVersion?: string;
  sessionCount?: number;
  sourceCount?: number;
  manualRevisionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AiSessionRequest {
  caseId: number;
  agentCode: AgentCode;
  modelId?: string;
}

export interface AiSessionLayerRequest {
  layer: AiLayer;
}

export interface AiSuggestion {
  id: number;
  tenantId: number;
  sessionId: number;
  kind: SuggestionKind;
  payloadJson: string;
  status: SuggestionStatus;
  handledBy?: number | null;
  handledAt?: string | null;
  note?: string;
  createdAt?: string;
}

export interface AiSuggestionRequest {
  kind: SuggestionKind;
  payloadJson: string;
}

export interface AiSuggestionHandleRequest {
  status: SuggestionStatus;
  note?: string;
}

export const AGENT_META: Record<AgentCode, { text: string; color: string }> = {
  CASE_SECRETARY: { text: "案件秘书", color: "blue" },
  TIME_DIGITAL: { text: "计时数字化", color: "cyan" },
  COMPLIANCE: { text: "合规助手", color: "red" },
  RESEARCH: { text: "检索研究", color: "purple" },
};

export const AI_LAYER_META: Record<AiLayer, { text: string; color: string }> = {
  DRAFT: { text: "草稿", color: "default" },
  CASE: { text: "入卷", color: "blue" },
  PENDING_CONFIRM: { text: "待确认", color: "orange" },
  EXPERIENCE_CANDIDATE: { text: "经验候选", color: "purple" },
  REVIEW: { text: "评审中", color: "gold" },
};

export const SUGGESTION_KIND_META: Record<SuggestionKind, { text: string; color: string }> = {
  TIME_ATTRIBUTION: { text: "计时归属", color: "blue" },
  CONFLICT_HINT: { text: "冲突提示", color: "red" },
  KNOWLEDGE_CARD: { text: "知识卡", color: "purple" },
  DOC_DRAFT: { text: "文书草稿", color: "cyan" },
  SUMMARY: { text: "摘要", color: "green" },
};

export const SUGGESTION_STATUS_META: Record<SuggestionStatus, { text: string; color: string }> = {
  PENDING: { text: "待处理", color: "orange" },
  ACCEPTED: { text: "已采纳", color: "success" },
  MODIFIED: { text: "已修改", color: "processing" },
  REJECTED: { text: "已拒绝", color: "default" },
};

// ============================================================
// 评审（办案产物评审闭环 · 待审/通过/驳回）
// ============================================================
export type ReviewArtifactType = "DOCUMENT" | "STRATEGY" | "PLAN" | "OUTCOME";
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface LegalReview {
  id: number;
  tenantId: number;
  caseId: number;
  artifactType: ReviewArtifactType;
  artifactRef: string;
  reviewerUserId?: number | null;
  status: ReviewStatus;
  reviewedAt?: string | null;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewRequest {
  caseId: number;
  artifactType: ReviewArtifactType;
  artifactRef: string;
  reviewerUserId?: number | null;
}

export interface ReviewDecisionRequest {
  status: ReviewStatus;
  comment?: string;
}

export const REVIEW_ARTIFACT_META: Record<ReviewArtifactType, { text: string; color: string }> = {
  DOCUMENT: { text: "文书", color: "blue" },
  STRATEGY: { text: "策略", color: "purple" },
  PLAN: { text: "计划", color: "cyan" },
  OUTCOME: { text: "结果", color: "green" },
};

export const REVIEW_STATUS_META: Record<ReviewStatus, { text: string; color: string }> = {
  PENDING: { text: "待审", color: "orange" },
  APPROVED: { text: "已通过", color: "success" },
  REJECTED: { text: "已驳回", color: "red" },
};
