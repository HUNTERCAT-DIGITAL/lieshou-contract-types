/**
 * Member 类型（与 crm-service Member 实体对齐 · V5 补齐）.
 *
 * isDeleted 后端 @JsonIgnore 不下发；此处不声明。
 */

export type MemberLevel = "NORMAL" | "SILVER" | "GOLD" | "PLATINUM";
export type MemberStatus = "ACTIVE" | "DISABLED";

export const MEMBER_LEVEL_META: Record<MemberLevel, { text: string; color: string }> = {
  NORMAL: { text: "普通", color: "default" },
  SILVER: { text: "银卡", color: "cyan" },
  GOLD: { text: "金卡", color: "gold" },
  PLATINUM: { text: "铂金", color: "purple" },
};

export const MEMBER_STATUS_META: Record<MemberStatus, { text: string; color: string }> = {
  ACTIVE: { text: "正常", color: "green" },
  DISABLED: { text: "停用", color: "red" },
};

export interface Member {
  id: number;
  /** 归属租户（强制取 JWT tid，请求体不允许指定） */
  tenantId: number;
  /** 会员对应客户（customers.id） */
  customerId: number;
  /** 会员号（租户内唯一） */
  memberNo: string;
  level: MemberLevel;
  /** 积分（>=0） */
  points: number;
  /** 储值余额（元） */
  balance: number;
  /** 有效期至（null = 长期有效） */
  expiresAt?: string | null;
  status: MemberStatus;
  remark?: string | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt: string;
  updatedAt?: string;
}

/** 新建会员（对应后端 CreateMemberRequest；tenant 由后端强制取请求租户） */
export interface CreateMemberRequest {
  customerId: number;
  memberNo: string;
  level?: MemberLevel;
  points?: number;
  balance?: number;
  expiresAt?: string;
  status?: MemberStatus;
  remark?: string;
}

/** 编辑会员（对应后端 UpdateMemberRequest；字段传入才更新） */
export interface UpdateMemberRequest {
  customerId?: number;
  memberNo?: string;
  level?: MemberLevel;
  points?: number;
  balance?: number;
  expiresAt?: string;
  status?: MemberStatus;
  remark?: string;
}
