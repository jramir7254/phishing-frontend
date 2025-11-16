// app/lib/logger.ts
// Enhanced front-end logger for Vite/React (DEV-only behavior)

type LogLevel = 'debug' | 'info' | 'success' | 'warn' | 'error' | 'fatal' | 'trace';

type AnyFn = (...args: any[]) => void;

export interface Logger {
    // basic levels
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    success: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (err: unknown, ...args: unknown[]) => void;
    fatal: (...args: unknown[]) => void;
    trace: (...args: unknown[]) => void;

    // utilities
    table: (...args: unknown[]) => void;
    count: (label: string) => void;
    time: (label: string) => void;
    timeEnd: (label: string) => void;
    json: (obj: unknown) => void;
    group: (label: string) => void;
    groupCollapsed: (label: string) => void;
    groupEnd: () => void;

    // process-style grouping with correlation
    startProcess: (id: string) => void;
    endProcess: () => void;

    // namespacing
    create: (namespace: string) => Logger;
}

// Detect development mode (works with Vite; safe fallback otherwise)
const isDev: boolean =
    typeof import.meta !== 'undefined' &&
    (import.meta as any)?.env &&
    Boolean((import.meta as any).env.DEV);

// Correlation ID support
let correlationId: string | null = null;
export function setCorrelationId(id: string) {
    correlationId = id;
}
export function clearCorrelationId() {
    correlationId = null;
}

// Get Mountain Time formatted hh:mm:ss
function getTime(): string {
    try {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Denver',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(new Date());
    } catch {
        // Fallback to local time if Intl/timezone not available
        return new Date().toLocaleTimeString();
    }
}

// Core formatting: timestamp, level, optional correlation ID
function formatPrefix(level: LogLevel): string {
    const time = getTime();
    const corr = correlationId ? `[${correlationId}] ` : '';
    return `%c${corr}[${time}] [${level.toUpperCase()}]%c`;
}

// CSS styles per level
const levelStyles: Record<LogLevel, string> = {
    debug: 'color:rgb(148, 74, 233)',
    info: 'color:rgb(71, 184, 236)',
    success: 'color:rgb(58, 223, 107); font-weight: bold',
    warn: 'color:#e5c07b',
    error: 'color:#e06c75; font-weight: bold',
    fatal: 'color:#be5046; font-weight: bold',
    trace: 'color:#c678dd',
};

// Build styled console args
function buildArgs(level: LogLevel, args: unknown[]): unknown[] {
    const prefix = formatPrefix(level);
    const style = levelStyles[level] || '';
    return [prefix, style, 'color: inherit', ...args];
}

// Base methods (untyped internal impl; exported as Logger later)
const methods = {
    debug: (...args: unknown[]) => {
        if (!isDev) return;
        console.debug(...(buildArgs('debug', args) as any[]));
    },
    info: (...args: unknown[]) => {
        if (!isDev) return;
        console.info(...(buildArgs('info', args) as any[]));
    },
    success: (...args: unknown[]) => {
        if (!isDev) return;
        console.log(...(buildArgs('success', args) as any[]));
    },
    warn: (...args: unknown[]) => {
        if (!isDev) return;
        console.warn(...(buildArgs('warn', args) as any[]));
    },
    error: (err: unknown, ...args: unknown[]) => {
        if (!isDev) return;

        // If it's an Error, print message and stack cleanly
        if (err instanceof Error) {
            console.error(...(buildArgs('error', [err.message, ...args]) as any[]));
            const stack = err.stack?.split('\n') ?? [];
            for (const line of stack) console.error('    ' + line);
            return;
        }

        // Otherwise treat first arg as message
        console.error(...(buildArgs('error', [err, ...args]) as any[]));
    },
    fatal: (...args: unknown[]) => {
        if (!isDev) return;
        console.error(...(buildArgs('fatal', args) as any[]));
    },
    trace: (...args: unknown[]) => {
        if (!isDev) return;
        console.trace(...(buildArgs('trace', args) as any[]));
    },

    // Tables & objects
    table: (...args: unknown[]) => {
        if (!isDev) return;
        console.groupCollapsed('📊 Table');
        console.table(...args);
        console.groupEnd();
    },

    // Counters & timers
    count: (label: string) => {
        if (!isDev) return;
        console.count(label);
    },
    time: (label: string) => {
        if (!isDev) return;
        console.time(label);
    },
    timeEnd: (label: string) => {
        if (!isDev) return;
        console.timeEnd(label);
    },

    // Structured JSON logging
    json: (obj: unknown) => {
        if (!isDev) return;
        console.log(...(buildArgs('info', [JSON.stringify(obj, null, 2)]) as any[]));
    },

    // Grouping
    group: (label: string) => {
        if (!isDev) return;
        console.group(label);
    },
    groupCollapsed: (label: string) => {
        if (!isDev) return;
        console.groupCollapsed(label);
    },
    groupEnd: () => {
        if (!isDev) return;
        console.groupEnd();
    },

    startProcess: (id: string) => {
        if (!isDev) return;
        setCorrelationId(id);
        methods.group(`[${correlationId}]`);
    },
    endProcess: () => {
        if (!isDev) return;
        methods.groupEnd();
        clearCorrelationId();
    },

} satisfies Omit<Logger, 'create'>;

// Namespace support
function create(namespace: string): Logger {
    const wrap =
        (fn: AnyFn) =>
            (...args: unknown[]) =>
                fn(`[${namespace}]`, ...args);

    const namespaced = Object.fromEntries(
        Object.entries(methods).map(([name, fn]) => [name, wrap(fn as AnyFn)])
    ) as Omit<Logger, 'create'>;

    return { ...namespaced, create };
}

export const logger: Logger = { ...(methods as Logger), create };