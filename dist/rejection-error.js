Object.defineProperty(exports, "__esModule", { value: true });
class RejectionError {
    constructor(error, type, uniqId) {
        this.error = error;
        this.type = type;
        this.uniqId = uniqId;
    }
    get Type() {
        return this.type;
    }
    get Error() {
        return this.error;
    }
    get UniqId() {
        return this.uniqId;
    }
    showErrorDetails() {
        let message = "Error";
        if (this.uniqId) {
            message += ` in '${this.uniqId}'`;
        }
        if (this.type) {
            message += ` with error type '${this.type}'`;
        }
        console.warn(message);
    }
    LogError(debug = false) {
        this.showErrorDetails();
        if (debug) {
            console.error(this.error);
        }
    }
    ThrowError() {
        this.showErrorDetails();
        throw this.error;
    }
}
exports.default = RejectionError;
