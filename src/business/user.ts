/**
 * User 类型（与 user-service User 实体对齐，Phase 7 · 用户管理 CRUD）.
 *
 * passwordHash 后端 WRITE_ONLY 绝不下发；此处不声明。
 */

export type UserStatus = "ACTIVE" | "DISABLED" | "LOCKED";

export interface User {
  id: number;
  /** 归属租户（多租户 · ADR-0022） */
  tenantId: number;
  username: string;
  displayName: string;
  email?: string | null;
  phone?: string | null;
  status: UserStatus;
  roles: string[];
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
}

/** 新建用户（对应后端 CreateUserRequest） */
export interface CreateUserRequest {
  username: string;
  displayName: string;
  password: string;
  email?: string;
  phone?: string;
}

/** 编辑用户（对应后端 UpdateUserRequest；password 传入才改） */
export interface UpdateUserRequest {
  displayName: string;
  email?: string;
  phone?: string;
  status: UserStatus;
  roles: string[];
  password?: string;
}

/** 状态 → 中文/颜色 映射（UI 共用） */
export const STATUS_META: Record<UserStatus, { text: string; color: string }> = {
  ACTIVE: { text: "启用", color: "green" },
  DISABLED: { text: "停用", color: "default" },
  LOCKED: { text: "锁定", color: "orange" },
};
