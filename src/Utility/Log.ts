/**
 * Debug/error levels for logging
 */
export enum LogLevel {
    DEBUG = "EL_DEBUG",
    WARNING = "EL_WARNING",
    ERROR = "EL_ERROR"
}

/**
 * A class for logging to the RUSK console - something that might one day exist
 * Static methods means a minimum of ceremony to do logging *right* (in a RUSK context).
 */
export class Log {
    /**
     * Log a debug message to RUSK
     * @param message - The message string to log
     */
    static Debug(message: string): void {
        this.sendLogMessage(message, LogLevel.DEBUG);
    }

    /**
     * Log a warning to RUSK
     * @param message - The message string to log as a warning
     */
    static Warning(message: string): void {
        this.sendLogMessage(message, LogLevel.WARNING);
    }

    /**
     * Log an error to RUSK
     * @param message - The message string to log as an error
     */
    static Error(message: string): void {
        this.sendLogMessage(message, LogLevel.ERROR);
    }

    private static sendLogMessage(message: string, level: LogLevel) {
        chrome.runtime.sendMessage({
            logMessage: message,
            logLevel: level
        });
    }
}