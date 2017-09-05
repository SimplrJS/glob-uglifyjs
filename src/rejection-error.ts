
export class RejectionError {
    constructor(private error: NodeJS.ErrnoException | Error, private type?: string, private uniqId?: string) {
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

    private showErrorDetails() {
        let message = "Error";

        if (this.uniqId) {
            message += ` in '${this.uniqId}'`;
        }

        if (this.type) {
            message += ` with error type '${this.type}'`;
        }
        console.warn(message);
    }

    LogError(debug: boolean = false) {
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
