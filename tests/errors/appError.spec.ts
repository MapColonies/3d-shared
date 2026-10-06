import { AppError } from '../../src/errors';

describe('AppError', () => {
  it('should keep name, status, message and operational flag', () => {
    const error = new AppError('catalog', 500, 'boom', true);

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('catalog');
    expect(error.status).toBe(500);
    expect(error.message).toBe('boom');
    expect(error.isOperational).toBe(true);
  });
});
