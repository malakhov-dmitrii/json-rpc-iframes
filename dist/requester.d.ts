import { Methods } from './types';
export declare class Requester<T extends Methods> {
    private counter;
    private pending;
    private targetOrigin;
    private target;
    private namespace;
    constructor(namespace: string, targetOrigin: string, target?: Window);
    private initialize;
    call<K extends keyof T>(method: K, ...params: Parameters<T[K]>): Promise<ReturnType<T[K]>>;
    get proxy(): T;
}
