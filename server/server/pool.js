import dotenv from "dotenv";
dotenv.config();
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

const connectDatabase = () => {
    const pool = new pg.Pool({
            connectionString: connectionString
    })
    return pool
}

export { connectDatabase }