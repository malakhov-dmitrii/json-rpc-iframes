import { JsonRpcRequest, JsonRpcResponse, Methods } from './types';

export class Requester<T extends Methods> {
  private counter = 0;
  private pending = new Map<number, { 
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }>();
  private targetOrigin: string;
  private target: Window;
  private namespace: string;

  constructor(namespace: string, targetOrigin: string, target: Window = window.parent) {
    this.namespace = namespace;
    this.targetOrigin = targetOrigin;
    this.target = target;
    this.initialize();
  }

  private initialize() {
    window.addEventListener('message', (event) => {
      if (event.origin !== this.targetOrigin) return;

      const response = event.data as JsonRpcResponse;
      if (!response || response.jsonrpc !== '2.0' || typeof response.id !== 'number') {
        return;
      }

      const pending = this.pending.get(response.id);
      if (!pending) return;

      this.pending.delete(response.id);

      if (response.error) {
        pending.reject(new Error(response.error.message));
      } else {
        pending.resolve(response.result);
      }
    });
  }

  async call<K extends keyof T>(
    method: K,
    ...params: Parameters<T[K]>
  ): Promise<ReturnType<T[K]>> {
    const id = this.counter++;
    
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      method: `${this.namespace}.${String(method)}`,
      params,
      id
    };

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.target.postMessage(request, { targetOrigin: this.targetOrigin });
    });
  }

  get proxy(): T {
    return new Proxy({} as T, {
      get: (_, method: string) => {
        return (...params: any[]) => this.call(method as keyof T, ...params);
      }
    });
  }
}