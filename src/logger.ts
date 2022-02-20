import winston from "winston"
import path from "path";

const logDir = './logs'
console.log('Saving logs to ' + logDir)
export const logger = winston.createLogger({
    level: process.env.LOGLEVEL || 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf((info) => {
                    return `${info.level}: ${info.message}\n`;
                })
            )
        }),
        new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logDir, 'combined.log') }),
    ],
});
