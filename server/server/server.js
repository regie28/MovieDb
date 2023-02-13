//import module/libraries
import express from "express";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import { connectDatabase } from "./pool.js"
import { auth } from "./middleware/auth.js";
import { generateJWT } from "./jwt/jwt.js";
import cors from "cors";
import { upload } from "./middleware/upload.js";
import fs from "fs";
import path from "path";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { infoLogger, errorLogger } from "./utils/logger.js";


//initialized backend
const app = express();
const pool = connectDatabase();
const PORT = process.env.port || 5000;

app.use(cors({origin: true, credentials: true}));

//Middlwares
app.use(express.json()); //req.body
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use(helmet({
    frameguard: {
        action: "deny",
    },
    xssFilter: true,
    crossOriginEmbedderPolicy: { policy: "cross-origin" },
}));

app.use("/image", express.static("public/upload"));

app.get('/',(req, res) =>
    res.send("MovieDB API")
);

//Login User
app.post("/api/v1/login", async(req, res) => {
    try{

        const { email, password } = req.body;

        const user = await pool.query(
            "SELECT * FROM public.users WHERE email = $1",[email]
        );
        if (user.rows.length === 0){
            return res.status(401).json("Email or Password doesn't match");
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);

        if (!validPassword) {
            return res.status(401).json("Email or Password doesn't match");
        }

        const token = generateJWT(user.rows[0]);
        request.cookie("access_token", token, {
            httpOnly: true,
        }).json({token})
    }
});

//Add/Register New User
app.post("/api/v1/register", async(req, res) => {
    try {
        const { username, fname, lname, email, password } = req.body;

        const user = await pool.query(
                `SELECT * FROM public.users WHERE email = $1`,
                [email]
        );
        if (user.rows.length !== 0){
            return res.status(401).json("Email already used!");
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);

        const bcryptPassword = await bcrypt.hash(password, salt);

        //Add The User to The Database
        const newUser = await pool.query(
            `INSERT INTO public.users(id, username, lname, email, password)
            VALUES ($1, $2, $3, $4) RETURNING *`,[id, username, lname, email, bcryptPassword]
        );

        const token = generateJWT(newUser.rows[0]);

        res.cookie("access_token", token, {
            httpOnly: true,
        }).json({token})
    } catch (err){
        errorLogger.error(err.message)
        res.status(500).send(err.message);
    }
});

//Verify User
app.get("/api/v1/verify", auth, async(req, res, next) => {
    try{
        res.json(true);
    } catch(err){
        errorLogger.error(err.message);
        res.status(500).sendStatus({
            msg: "Unauthorized"
        });
    }
});

app.get("/api/v1/userprofile", auth, async(req, res) => {
    try{
        const user = await pool.query(
            `SELECT * FROM public.users WHERE id = $1`,
            [req.user.id]
        );
        res.json(user.rows[0]);
    } catch (err) {
        errorLogger.error(err);
        res.status(500).send({
            msg: "Unauthorized",
        });
    }
});

//Logout
app.get("api/v1/logout",(req, res) => {
    try{
        res.clearCookie("access_token",null).send({
            authenticated: false,
            msg: "Logout Successfully",
        });
    } catch(err){
        errorLogger.error(err);
    }
});


//Add New Movie
app.post("/api/v1/new/movie", auth, upload.array("file", 1),
async(req, res) => {
    try{
        const {
            image_url = req.file[0].filename,
        } = req.file;

        const {
            title,
            plot,
            language,
            budget,
            release_date,
            trailer_url,
            runtime
        } = req.body;

        const userRole = req.role.id;

        if(userRole !== 'admin');
        res.status(500).send("Unauthorized")

        const newMovie = await pool.query(
            `INSERT INTO public.movie (title, plot, language, budget, release_date, trailer_url, runtime, image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [title, plot, language, budget, release_date, trailer_url,runtime, image_url]
        )
    }
}
)


