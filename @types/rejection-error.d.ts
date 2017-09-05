/// <reference types="node" />
export declare class RejectionError {
    private error;
    private type;
    private uniqId;
    constructor(error: NodeJS.ErrnoException | Error, type?: string | undefined, uniqId?: string | undefined);
    readonly Type: string | undefined;
    readonly Error: NodeJS.ErrnoException | Error;
    readonly UniqId: string | undefined;
    private showErrorDetails();
    LogError(debug?: boolean): void;
    ThrowError(): void;
}
