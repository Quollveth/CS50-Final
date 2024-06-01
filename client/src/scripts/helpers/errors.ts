class CustomError extends Error {
    constructor(message:string) {
        super(message);
        this.name = this.constructor.name;
    }
}

/**
 * Error to be thrown when a request fails
 * @param message Error message
 * @param status HTTP status code, default is 500 for when the server does not respond
 * @param response Response from the server, if any
 */
export class ServerError extends CustomError {
    public status:number;
    public response:any;

    constructor(message:string, status:number = 500, response:any = null) {
        super(message);
        this.status = status;
        this.response = response;
    }
}

/**
 * Error to be thrown when a file operation fails
 * @param message Error message
 */
export class FileError extends CustomError {
    constructor(message:string) {
        super(message);
    }
}