/// <reference types="node" />
export default class RejectionError {
    private error;
    private type;
    private uniqId;
    constructor(error: NodeJS.ErrnoException | Error, type?: string, uniqId?: string);
    readonly Type: string | undefined;
    readonly Error: Error | NodeJS.ErrnoException;
    readonly UniqId: string | undefined;
    private showErrorDetails();
    LogError(debug?: boolean): void;
    ThrowError(): void;
}
