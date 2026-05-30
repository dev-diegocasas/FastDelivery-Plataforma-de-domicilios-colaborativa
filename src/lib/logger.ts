type LogLevel = "info" | "warn" | "error" | "debug";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = (process.env.LOG_LEVEL ?? "info") as LogLevel;

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) return;

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (meta && Object.keys(meta).length > 0) {
    console.log(`${prefix} ${message}`, JSON.stringify(meta));
  } else {
    console.log(`${prefix} ${message}`);
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) =>
    log("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) =>
    log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) =>
    log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) =>
    log("error", message, meta),
};

export function withErrorLog<T>(
  actionName: string,
  fn: () => Promise<T>,
): Promise<T> {
  return fn().catch((err) => {
    logger.error(`Action failed: ${actionName}`, {
      error: (err as Error).message,
    });
    throw err;
  });
}
