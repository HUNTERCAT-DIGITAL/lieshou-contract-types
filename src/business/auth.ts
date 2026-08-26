/**
 * Auth 类型 (Phase 5 · JWT 鉴权闭环).
 * 与后端 cn.huntercat.lieshoucloudpro.auth.web.dto.AuthDtos 对齐.
 */

export interface LoginRequest {
  /** 租户编码（可选，默认 jxlkas · ADR-0022） */
  tenantCode?: string;
  username: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  tokenType: "Bearer";
  userId: number;
  username: string;
  /** 租户编码（登录响应 · ADR-0035） */
  tenantCode?: string;
  /** 租户显示名 */
  tenantName?: string;
  /** 租户版别：GENERIC | LAYER | ZHIYE | JMZZ（登录响应 · ADR-0035） */
  tenantEdition?: string;
}

export interface CurrentUser {
  userId: number;
  tenantId?: number;
  tenantCode?: string;
  tenantName?: string;
  tenantEdition?: string;
  username: string;
  roles: string[];
  /** 权限码（ADR-0024 Phase 2 · 菜单可见性与接口鉴权共用数据源） */
  permissions?: string[];
}

/** 鉴权 store 状态 */
export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: CurrentUser | null;
  isAuthenticated: boolean;
}
