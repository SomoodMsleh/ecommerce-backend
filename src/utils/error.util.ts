
class ApiError extends Error {
    statusCode : number; // HTTP status code
    isOperational : boolean; //to differentiate between operational errors and programming errors

    constructor(message:string, statusCode:number, isOperational:boolean = true){
        super(message); // call the parent constructor
        this.statusCode = statusCode; 
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor); // to exclude the constructor from the stack trace
    }

}

export default ApiError;