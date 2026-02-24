import { request } from 'undici';

const DEFAULT_TIMEOUT = 30000;
const MAX_RETRIES = 3;

export async function httpGet<T>(url: string, options?: { timeout?: number }): Promise<T> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await request(url, {
        method: 'GET',
        headersTimeout: timeout,
        bodyTimeout: timeout,
      });

      if (response.statusCode >= 400) {
        throw new Error(`HTTP ${response.statusCode} from ${url}`);
      }

      return await response.body.json() as T;
    } catch (error) {
      if (attempt === MAX_RETRIES) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error('unreachable');
}

export async function httpGetBuffer(url: string, options?: { timeout?: number }): Promise<Buffer> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await request(url, {
        method: 'GET',
        headersTimeout: timeout,
        bodyTimeout: timeout,
      });

      if (response.statusCode >= 400) {
        throw new Error(`HTTP ${response.statusCode} from ${url}`);
      }

      const arrayBuffer = await response.body.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      if (attempt === MAX_RETRIES) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error('unreachable');
}
