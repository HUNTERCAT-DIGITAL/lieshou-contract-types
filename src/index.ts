/**
 * 共享业务类型 — monorepo 跨 app 共用（L0 契约层 · Bottom-Up）。
 *
 * 结构：
 * - `./business/*`：业务 DTO 手写收敛层（来自各端重复类型的去重收敛，
 *   以 admin-web 为事实源；商业服务 OpenAPI 上线后逐步替换为自动生成）
 * - `./generated.ts`：底座 user-service OpenAPI 自动生成契约快照
 * - `./generated.{crm,finance,inventory,iot,approval}.ts`：L3 商业服务 OpenAPI
 *   自动生成契约快照（gen:api:l3 脚本，以后端为事实源；仅作契约参考，业务代码请走 business 层）
 *
 * 注意：`export *` 遇同名符号（如 STATUS_META）静默跳过，不导出；
 * 需要时按深路径 `@lieshoucloud/contract-types/business/<module>` 引用。
 */

// -------- 通用工具类型 --------

/** 通用 API 响应包装 */
export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

/** 健康状态 / 跨端共享 */
export type HealthStatus = "up" | "down" | "degraded";

/**
 * 行业能力 ID（客户定制层与行业层解耦的公共契约 · 2026-09）.
 * 行业层（LieShouCloudPro-industry 包）提供能力；客户 Edition 声明启用哪些行业。
 */
export type IndustryId = "generic" | "edu" | "legal" | "iot";

/** 状态 → 中文文本 + antd Tag 颜色（共享给 ui 包的 StatusTag） */
export interface StatusMeta {
  text: string;
  color: string;
}

/** 安全查找：避免任何 key 不存在的运行时崩 */
export function getStatusMeta<T extends string>(meta: Record<T, StatusMeta>, key: T): StatusMeta {
  return meta[key];
}

/** antd Tag 可用颜色 */
export type RoleTagColor = string;

// -------- 业务 DTO（来自 ./business/* 收敛层） --------

// —— 无冲突模块：整模块导出 ——
export * from "./business/approval";
export * from "./business/audit";
export * from "./business/auth";
export * from "./business/contact";
export * from "./business/contract";
export * from "./business/finance";
export * from "./business/inventory";
export * from "./business/iot";
export * from "./business/lead";
export * from "./business/member";
export * from "./business/menu";
export * from "./business/quality";
export * from "./business/role";
export * from "./business/supply";
export * from "./business/tenant";

// —— 含同名符号（STATUS_META / ContactLetter / LetterStatus / LETTER_STATUS_META）的模块：
//    显式导出，冲突符号不导出（需用时走深路径 @lieshoucloud/contract-types/business/<module>） ——
export type { CustomerStatus, Customer, CreateCustomerRequest, UpdateCustomerRequest } from "./business/customer";
export type { DispatchStatus, DispatchRecord, CreateDispatchRequest } from "./business/dispatch";
export type {
  TeacherStatus,
  Teacher,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  SUBJECT_OPTIONS,
} from "./business/teacher";
export type { UserStatus, User, CreateUserRequest, UpdateUserRequest } from "./business/user";
export type {
  LetterType,
  CreateLetterRequest,
  UpdateLetterRequest,
  LETTER_TYPE_META,
  LetterTemplate,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  LETTER_TEMPLATE_LABELS,
  ResponseType,
  ResponseSentiment,
  ResponseStatus,
  CustomerResponse,
  CreateResponseRequest,
  UpdateResponseRequest,
  RESPONSE_TYPE_META,
  SENTIMENT_META,
  RESPONSE_STATUS_META,
  CustomerSuccessSummary,
  FollowUpFilter,
  FOLLOW_UP_FILTER_META,
} from "./business/customerSuccess";
export type {
  CaseType,
  CaseStatus,
  CaseStage,
  CasePriority,
  EventType,
  DocType,
  ExpenseType,
  LegalCase,
  CaseEvent,
  CreateCaseRequest,
  UpdateCaseRequest,
  CaseEventRequest,
  LegalDocument,
  DocumentRequest,
  TimeEntry,
  TimeEntryStatus,
  TIME_ENTRY_STATUS_META,
  TimeEntryRequest,
  TimeEntrySummary,
  Expense,
  ExpenseRequest,
  ExpenseSummary,
  LegalPage,
  WorkbenchSummary,
  RecentWorkItem,
  KnowledgeCardType,
  KnowledgeCardStatus,
  KnowledgeCard,
  KnowledgeCardRequest,
  KnowledgeSummary,
  GrowthDimension,
  GrowthSummary,
  KNOWLEDGE_TYPE_META,
  KNOWLEDGE_STATUS_META,
  CASE_STATUS_META,
  CASE_STAGE_META,
  CASE_PRIORITY_META,
  CASE_TYPE_META,
  EVENT_TYPE_META,
  DOC_TYPE_META,
  EXPENSE_TYPE_META,
  CaseStageFlow,
  CASE_STAGE_FLOW,
  GateType,
  GateStatus,
  Gate,
  GATE_TYPE_META,
  GATE_STATUS_META,
  DATA_CLASS_META,
  LetterDirection,
  LetterRequest,
  LetterSummary,
  LETTER_DIRECTION_META,
  ClientLifecycleStage,
  ClientStatus,
  ClientValueType,
  LegalClient,
  ClientValueRecord,
  ClientRequest,
  ClientSuccessSummary,
  CLIENT_STAGE_META,
  CLIENT_STATUS_META,
  CLIENT_VALUE_META,
  CLIENT_STAGE_OPTIONS,
  CLIENT_STATUS_OPTIONS,
  ScheduleType,
  ScheduleResponsibility,
  MatterSchedule,
  ScheduleRequest,
  ScheduleConflict,
  ScheduleCapacity,
  MatterCalendarSummary,
  SCHEDULE_TYPE_META,
  SCHEDULE_RESPONSIBILITY_META,
  SCHEDULE_TYPE_OPTIONS,
  SCHEDULE_RESPONSIBILITY_OPTIONS,
  WEEKDAY_TEXT,
  OrgSignalType,
  OrgActionType,
  TeamMember,
  OrgSignal,
  OrgBoard,
  OrgAction,
  CareerMilestone,
  EnablementSummary,
  ORG_SIGNAL_META,
  ORG_ACTION_META,
  ORG_BOARD_META,
  GovernanceCategory,
  GovernanceStatus,
  GovernanceItem,
  AuditEvent,
  GovernanceRule,
  GovernanceSummary,
  GOV_CATEGORY_META,
  GOV_STATUS_META,
  GOV_SEVERITY_META,
  GOV_CATEGORY_OPTIONS,
} from "./business/legal";
