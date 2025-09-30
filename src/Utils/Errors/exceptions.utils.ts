import { HttpException } from "./http-exception.utils";

export class BadRequestException extends HttpException {
  constructor(message: string, public error?: Object) {
    super(message, 400, error);
  }
}
export class ConflictException extends HttpException {
  constructor(message: string, public error?: Object) {
    super(message, 409, error);
  }
}
export class NotFoundException extends HttpException {
  constructor(message: string, public error?: Object) {
    super(message, 404, error);
  }
}
export class UnauthorizedException extends HttpException {
  constructor(message: string, public error?: Object) {
    super(message, 401, error);
  }
}

export class TooManyRequestsException extends HttpException {
  constructor(message: string, public error?: Object) {
    super(message, 429, error);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: string, public error?: Object) {
    super(message, 500, error);
  }
}
