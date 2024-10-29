import { Methods, Middleware } from './types';
export declare class Responder<T extends Methods> {
    private handlers;
    private middlewares;
    private namespace;
    private targetOrigin;
    constructor(namespace: string, targetOrigin: string);
    private initialize;
    subscribe<K extends keyof T>(method: K, handler: T[K]): void;
    use(middleware: Middleware): void;
}
