import { Response } from 'express';

// 标准API响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// 成功响应
export function successResponse<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: any
): Response<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
  
  return res.status(statusCode).json(response);
}

// 错误响应
export function errorResponse(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: any
): Response<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };
  
  return res.status(statusCode).json(response);
}

// 分页响应
export function paginatedResponse<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  statusCode: number = 200
): Response<ApiResponse<T[]>> {
  const totalPages = Math.ceil(total / limit);
  
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }
  };
  
  return res.status(statusCode).json(response);
}

// 常用错误响应快捷方法
export const ErrorResponses = {
  // 400 Bad Request
  badRequest: (res: Response, message: string = '请求参数错误', details?: any) =>
    errorResponse(res, 'BAD_REQUEST', message, 400, details),
  
  // 401 Unauthorized
  unauthorized: (res: Response, message: string = '未授权访问') =>
    errorResponse(res, 'UNAUTHORIZED', message, 401),
  
  // 403 Forbidden
  forbidden: (res: Response, message: string = '禁止访问') =>
    errorResponse(res, 'FORBIDDEN', message, 403),
  
  // 404 Not Found
  notFound: (res: Response, message: string = '资源不存在') =>
    errorResponse(res, 'NOT_FOUND', message, 404),
  
  // 409 Conflict
  conflict: (res: Response, message: string = '资源冲突') =>
    errorResponse(res, 'CONFLICT', message, 409),
  
  // 422 Unprocessable Entity
  validationError: (res: Response, message: string = '数据验证失败', details?: any) =>
    errorResponse(res, 'VALIDATION_ERROR', message, 422, details),
  
  // 429 Too Many Requests
  tooManyRequests: (res: Response, message: string = '请求过于频繁') =>
    errorResponse(res, 'TOO_MANY_REQUESTS', message, 429),
  
  // 500 Internal Server Error
  internalError: (res: Response, message: string = '服务器内部错误') =>
    errorResponse(res, 'INTERNAL_ERROR', message, 500),
  
  // 503 Service Unavailable
  serviceUnavailable: (res: Response, message: string = '服务暂时不可用') =>
    errorResponse(res, 'SERVICE_UNAVAILABLE', message, 503)
};

// 业务相关错误响应
export const BusinessErrors = {
  // 认证相关
  unauthorized: (res: Response, message: string = '未授权访问') =>
    errorResponse(res, 'UNAUTHORIZED', message, 401),

  forbidden: (res: Response, message: string = '禁止访问') =>
    errorResponse(res, 'FORBIDDEN', message, 403),

  internalError: (res: Response, message: string = '服务器内部错误') =>
    errorResponse(res, 'INTERNAL_ERROR', message, 500),

  // 用户相关
  userNotFound: (res: Response) =>
    errorResponse(res, 'USER_NOT_FOUND', '用户不存在', 404),

  userAlreadyExists: (res: Response) =>
    errorResponse(res, 'USER_ALREADY_EXISTS', '用户已存在', 409),

  invalidCredentials: (res: Response) =>
    errorResponse(res, 'INVALID_CREDENTIALS', '用户名或密码错误', 401),
  
  // 占卜相关
  insufficientBalance: (res: Response) =>
    errorResponse(res, 'INSUFFICIENT_BALANCE', '占卜次数不足', 402),
  
  divinationNotFound: (res: Response) =>
    errorResponse(res, 'DIVINATION_NOT_FOUND', '占卜记录不存在', 404),
  
  divinationFailed: (res: Response, reason?: string) =>
    errorResponse(res, 'DIVINATION_FAILED', reason || '占卜失败', 500),
  
  // 支付相关
  paymentFailed: (res: Response, reason?: string) =>
    errorResponse(res, 'PAYMENT_FAILED', reason || '支付失败', 402),
  
  orderNotFound: (res: Response) =>
    errorResponse(res, 'ORDER_NOT_FOUND', '订单不存在', 404),
  
  // Token相关
  tokenExpired: (res: Response) =>
    errorResponse(res, 'TOKEN_EXPIRED', 'Token已过期', 401),
  
  tokenInvalid: (res: Response) =>
    errorResponse(res, 'TOKEN_INVALID', 'Token无效', 401)
};
