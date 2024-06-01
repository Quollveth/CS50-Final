class CustomError extends Error {
    constructor(message:string) {
        super(message);
        this.name = this.constructor.name;
    }
}

/**
 * Error to be thrown when a request fails.
 */
export class ServerError extends CustomError {
    public status: number;
    public response: any;

    /**
     * Creates a new ServerError instance.
     * @param message Error message.
     * @param status HTTP status code, default is 500 for when the server does not respond.
     * @param response Response from the server, if any.
     */
    constructor(message: string, status: number = 500, response?: any) {
        super(message);
        this.status = status;
        this.response = response;
    }
}

/**
 * Error to be thrown when a user is not authenticated.
 */
export class AuthError extends ServerError {
    /**
     * Creates a new AuthError instance.
     * @param response Response from the server, if any.
     */
    constructor(response?: any) {
        super('User is not authenticated', 401, response);
    }
}

export type ServerErrorType = ServerError | AuthError;
/**
 * Automatically throws the proper error based on the response status.
 * @param xhr XMLHttpRequest or any object with status and responseJSON properties.
 * @param expected List of handled status codes, no error is thrown if the status code is in this list.
 * @return {ServerError | AuthError} Returns an appropriate error based on the status code, or null if the status code is in the expected list.
 */
export const throwServerError = (
    xhr: { status: number; responseJSON?: { result?: any } },
    expected?: number[]
): ServerErrorType|null => {
    if (expected && expected.includes(xhr.status)) {
        return null;
    }

    switch (xhr.status) {
        case 401:
            return new AuthError(xhr.responseJSON);
        case 500:
            return new ServerError('Server did not respond');
        default:
            return new ServerError('Request failed', xhr.status, xhr.responseJSON);
    }
};


/**
 * Error to be thrown when a file operation fails.
 */
export class FileError extends CustomError {}