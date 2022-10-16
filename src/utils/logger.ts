import winston from "winston";

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format((info) => ({ ...info, level: info.level.toUpperCase() }))(),
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf(({ level, message, label, timestamp }) => {
      return `${timestamp} [${level}] ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});
