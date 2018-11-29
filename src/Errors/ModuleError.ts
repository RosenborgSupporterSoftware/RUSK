import { RUSKError } from "./RUSKError";

/**
 * Errors that occur during execution of a module will be sent as this type
 */

export class ModuleError extends RUSKError {

    private readonly _moduleName: string;
    private readonly _step: string;
    private readonly _message: string;
    private readonly _exception: any; // TODO: Can we do better than "any"?

    // Property access methods

    /** Gets the name of the module at fault */
    get ModuleName(): string {
        return this._moduleName;
    }

    /** Gets the step that caused the fault */
    get Step(): string {
        return this._step;
    }

    /** Gets the error message returned */
    get Message(): string {
        return this._message;
    }

    /** Gets the exception thrown by the error (if any) */
    get Exception(): string {
        return this._exception;
    }

    /**
     *
     * @param moduleName - The name of the module that caused an error to happen
     * @param step - The name of the execute step (init, preprocess or execute) that caused the error
     * @param message - The error message that was caused
     * @param exception - The exception object (if any) of the error
     */
    constructor(moduleName: string, step: string, message: string, exception: any = null) {
        super();

        this._moduleName = moduleName;
        this._step = step;
        this._message = message;
        this._exception = exception;
    }
}
