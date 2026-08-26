/**
 * 质检追溯类型（inventory-service · ADR-0037）.
 * 与后端 Batch / QualityInspection 实体对齐（方案 A：批次仅追溯，不参与库存核算）。
 */

export interface Batch {
  id: number;
  tenantId: number;
  productId: number;
  batchNo: string;
  supplier?: string | null;
  quantity: number;
  remark?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export type InspectionType = "IQC" | "IPQC" | "FQC";
export type InspectionResult = "PASS" | "FAIL";

export interface QualityInspection {
  id: number;
  tenantId: number;
  productId: number;
  batchId?: number | null;
  type: InspectionType;
  result: InspectionResult;
  quantity: number;
  inspector?: string | null;
  inspectedAt?: string | null;
  remark?: string | null;
  createdAt: string;
}

/** 批次详情（含追溯链路：质检 + 出入库流水） */
export interface BatchDetail {
  batch: Batch;
  productName?: string | null;
  inspections: QualityInspection[];
  movements: Array<{
    id: number;
    tenantId: number;
    productId: number;
    type: "IN" | "OUT";
    quantity: number;
    batchId?: number | null;
    remark?: string | null;
    createdAt: string;
  }>;
}

/** 质检详情（含商品名 + 批次号） */
export interface InspectionDetail {
  inspection: QualityInspection;
  productName?: string | null;
  batchNo?: string | null;
}

/** 商品追溯（ADR-0037 · 异常一键定位到批次与供应商） */
export interface ProductTrace {
  product: {
    id: number;
    name: string;
    code?: string | null;
    unit?: string | null;
    stockQuantity: number;
  };
  batches: Batch[];
  inspections: QualityInspection[];
  movements: BatchDetail["movements"];
}

/** 创建批次 */
export interface CreateBatchRequest {
  productId: number;
  batchNo: string;
  supplier?: string;
  quantity: number;
  remark?: string;
}

/** 创建质检记录 */
export interface CreateInspectionRequest {
  productId: number;
  batchId?: number;
  type: InspectionType;
  result: InspectionResult;
  quantity: number;
  inspector?: string;
  inspectedAt?: string;
  remark?: string;
}

/** 状态元数据（前端展示） */
export const INSPECTION_TYPE_META: Record<InspectionType, { text: string; color: string }> = {
  IQC: { text: "来料检验", color: "blue" },
  IPQC: { text: "制程检验", color: "geekblue" },
  FQC: { text: "成品检验", color: "purple" },
};

export const INSPECTION_RESULT_META: Record<InspectionResult, { text: string; color: string }> = {
  PASS: { text: "合格", color: "green" },
  FAIL: { text: "不合格", color: "red" },
};
