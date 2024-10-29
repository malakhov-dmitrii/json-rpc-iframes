import { describe, it, expect, vi } from 'vitest';
import { Requester, Responder } from '../index';

describe('JSON-RPC iframe communication', () => {
  const mockOrigin = 'https://example.com';

  type TestMethods = {
    echo: (message: string) => string;
    add: (a: number, b: number) => number;
  };

  it('should handle basic RPC calls', async () => {
    const responder = new Responder<TestMethods>('test', mockOrigin);
    const requester = new Requester<TestMethods>('test', mockOrigin);

    responder.subscribe('echo', (message) => message);
    responder.subscribe('add', (a, b) => a + b);

    const echoResult = await requester.call('echo', 'hello');
    expect(echoResult).toBe('hello');

    const addResult = await requester.call('add', 2, 3);
    expect(addResult).toBe(5);
  });

  it('should support proxy-based calls', async () => {
    const responder = new Responder<TestMethods>('test', mockOrigin);
    const requester = new Requester<TestMethods>('test', mockOrigin);

    responder.subscribe('add', (a, b) => a + b);

    const result = await requester.proxy.add(2, 3);
    expect(result).toBe(5);
  });

  it('should handle middleware', async () => {
    const responder = new Responder<TestMethods>('test', mockOrigin);
    const requester = new Requester<TestMethods>('test', mockOrigin);

    const middleware = vi.fn();
    responder.use(middleware);
    responder.subscribe('echo', (message) => message);

    await requester.call('echo', 'test');
    expect(middleware).toHaveBeenCalledWith('echo', ['test']);
  });
});