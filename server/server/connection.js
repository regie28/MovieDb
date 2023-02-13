/*import dotenv from "dotenv";
dotenv.config();
import http from "http";
import { connectDatabase } from "./pool.js";
import { app } from "./server.js";
import { infoLogger, errorLogger } from "./utils/logger.js";

const pool = connectDatabase();
const server = http.createServer(app);
const PORT = process.env.port || 5000;

pool.connect((err) => {
    if(err) {
        errorLogger.error(`There was an error connecting to ${PORT}`);
    } else {
        server.listen(PORT, () => {
            infoLogger.info(`Server is running on port ${PORT}`);
        });
    }
});*/