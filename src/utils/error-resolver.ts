import { logger } from './logger';

export function errorResolver<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  location: string,
) {
  return async function (...args: Args): Promise<T> {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(error, `Error in ${location}`);
      throw error;
    }
  };
}
