/**
 * 登录能力配置（端薄壳化 · 2026-08-29 决策）.
 *
 * 登录是「可配置的平台能力」而非固定页面：
 * - required=false → 纯展示端（官网/门户）游客直达, 不拦截路由
 * - mode 决定登录形态（账号密码 / 验证码 / SSO / 无）
 * - 客户要完全自定义登录页 → 端仓 Edition.extraRoutes 注入 standalone 登录页
 */
export interface EditionLogin {
  /** 是否需要登录（false = 游客直达, 不拦截路由） */
  required?: boolean;
  /** 登录模式: password 账号密码 / sms 短信验证码 / sso 单点 / none 无 */
  mode?: "password" | "sms" | "sso" | "none";
  /** 登录页品牌标语（客户注入, 缺省用 edition.slogan） */
  brandMessage?: string;
}
