export class AppError extends Error {
  public override readonly name: string;
  public readonly status: number;
  public readonly isOperational: boolean;

  public constructor(name: string, status: number, description: string, isOperational: boolean) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.status = status;
    this.isOperational = isOperational;
    this.message = description;

    Error.captureStackTrace(this);
  }
}
