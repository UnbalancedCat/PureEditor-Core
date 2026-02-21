// ===================================
// Logging System (Level-based)
// ===================================
export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    OFF: 4
};

// Default level
let currentLogLevel = LogLevel.DEBUG;

export const Logger = {
    debug: (...args) => {
        if (currentLogLevel <= LogLevel.DEBUG) {
            console.log('[DEBUG]', ...args);
            if (window.editorHost && window.editorHost.log) window.editorHost.log("DEBUG", args.join(" "));
        }
    },
    info: (...args) => {
        if (currentLogLevel <= LogLevel.INFO) {
            console.log('[INFO]', ...args);
            if (window.editorHost && window.editorHost.log) window.editorHost.log("INFO", args.join(" "));
        }
    },
    warn: (...args) => {
        if (currentLogLevel <= LogLevel.WARN) {
            console.warn('[WARN]', ...args);
            if (window.editorHost && window.editorHost.log) window.editorHost.log("WARN", args.join(" "));
        }
    },
    error: (...args) => {
        if (currentLogLevel <= LogLevel.ERROR) {
            console.error('[ERROR]', ...args);
            if (window.editorHost && window.editorHost.log) window.editorHost.log("ERROR", args.join(" "));
        }
    }
};

export function setLogLevel(levelName) {
    const key = levelName.toUpperCase();
    if (LogLevel.hasOwnProperty(key)) {
        currentLogLevel = LogLevel[key];
        Logger.info(`[Logger] Log level set to: ${key}`);
    } else {
        Logger.warn(`[Logger] Invalid log level: ${levelName}. Available: DEBUG, INFO, WARN, ERROR, OFF`);
    }
}

export function setDebugMode(enable) {
    currentLogLevel = enable ? LogLevel.DEBUG : LogLevel.INFO;
    Logger.info(`[Logger] Debug mode: ${enable ? 'ON' : 'OFF'} (Level: ${enable ? 'DEBUG' : 'INFO'})`);
}
