/**
 * Custom Error Hierarchy
 * 
 * OOP: Inheritance — all errors extend AppError (abstract base)
 * OOP: Polymorphism — error handler uses instanceof to determine HTTP status
 * SOLID: SRP — each error class represents one type of failure
 */

export abstract class AppError extends Error {
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Maintain proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): { error: string; details?: string } {
    return { error: this.message };
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400;

  constructor(message: string = 'Validation failed') {
    super(message);
  }
}

export class AuthError extends AppError {
  readonly statusCode = 401;

  constructor(message: string = 'Authentication failed') {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;

  constructor(message: string = 'Forbidden') {
    super(message);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;

  constructor(message: string = 'Resource not found') {
    super(message);
  }
}

export class ConflictError extends AppError {
  readonly statusCode = 409;

  constructor(message: string = 'Resource already exists') {
    super(message);
  }
}

export class StockError extends AppError {
  readonly statusCode = 409;

  constructor(message: string = 'Item out of stock') {
    super(message);
  }
}
