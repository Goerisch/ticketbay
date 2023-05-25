import {CustomError} from './custom-error';

export class BadRequestError extends CustomError {
    statusCode = 400;

    constructor(message: string) {
        super(message);
        //Because we extend a built in class
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }

    serializeErrors() {
        return [{message: this.message}];
    }
}
