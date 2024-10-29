export interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params: any[];
  id: number | string | null;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: number | string | null;
}

export type MethodHandler = (...args: any[]) => any | Promise<any>;
export type Methods = Record<string, MethodHandler>;
export type Middleware = (method: string, params: any[]) => any | Promise<any>;