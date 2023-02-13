import pino from "pino";
import pinoPretty from "pino-pretty";

const prettyStdOut = pinoPretty({
    colorize: true,
});

export const infoLogger = pino(
    {
        level: process.env.NODE_ENV === 'development' ? 'info' : 'debug',
        stream: process.env.NODE_ENV !== 'development' ? prettyStdOut : process.stdout,
    },
);

export const errorLogger = pino(
    {
        level: process.env.NODE_ENV === 'development'? 'error' : 'debug',
        stream: process.env.NODE_ENV!== 'development' ? prettyStdOut : process.stdErr,
    }
);
