import { connectDatabase } from '../pool.js';
import bcrypt from 'bcryptjs';
import { generateJWT } from '../jwt/jwt.js';
import { refreshToken } from '../jwt/refreshToken.js';
import { errorLogger, infoLogger } from '../utils/logger.js';
const pool = connectDatabase()

//Get All User
export const getAllUser = async(req, res) => {
    try{
        const limit = req.query.limit || 10;
        const page = req.query.page || 1;
        const offset = (page - 1) * limit;
        const users = await pool.query(`
        SELECT * FROM public.users
        ORDER BY id ASC LIMIT$1 OFFSET $2`,[limit, offset]);
        res.status(200).send(users.rows)
    } catch(err){
        errorLogger.error('Error')
    }
}

//Register User
export const registerUser = async(req, res) => {
    try {
        const {
            username,
            password,
            firstname,
            lastname,
            email,
            about,
        } = req.body;

        const image = req.file;
        //Check if the username is already exist
        const user = await pool.query(`SELECT * FROM public.users WHERE username = $1`,[username])

        if(user.rows.length > 0){
            res.status(401).send("User already exists")
        }

        //Bcrypt for password hashing
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt)

        //Add User to DB
        const newUser = await pool.query(`INSERT INTO public.users(username, firstname, lastname, password, email, about)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        `,[username, firstname, lastname, bcryptPassword, email, about])

        //generate Token
        const accessToken = generateJWT(newUser.rows[0])
        infoLogger.info("Access Token:",accessToken)

        //refresh Token
        const refresh_Token = refreshToken(newUser.rows[0])
        infoLogger.info("Refresh Token:",refresh_Token)

        const userId = newUser.rows[0].id

        //Add Image to Image Table
        const newImage = await pool.query(`
        INSERT INTO public.image(filename, image_url)
        VALUES ($1, $2)
        RETURNING id
        `,[image.filename, image.path]);

        const imageId = newImage.rows[0].id;

        //Add New Entry to User_image
        await pool.query(`
        INSERT INTO public.user_image(image_id, user_id)
        VALUES ($1, $2)`,[imageId, userId])
        res.status(201).send('Successfully Created');


    }
    catch(error){
        console.error(error);
    res.status(500).send('Unauthenticated!');
    }
}

//Login User
export const login = async(req, res) => {
    try {

        //Ask UserName and Password from the req body
        const {
            username,
            password
        } = req.body;

        const user = await pool.query(`SELECT * FROM public.users WHERE username = $1`,[username])

        if(user.rows.length > 0) {
            infoLogger.info("Failed To Login")
            return res.status(401).send({error: "User does not exists"})
        }

        //Check the password
        const validPassword = await bcrypt.compare(password, user.rows[0].password)
        if(!validPassword) {
            infoLogger.info("Failed To Login")
            return res.status(401).send({error: "Password is incorrect"})
        }

        //Generate and return the JWT
        //Access TOken
        const accessToken = generateJWT(user.rows[0])
        infoLogger.info("Access Token:",accessToken)

        //refresh token
        const refresh_Token =  generateJWT(user.rows[0])
        infoLogger.info("Refresh Token:",refresh_Token)

        const userId = user.rows[0].id

        //store token to cookie
        res.cookie('SetCookie', refreshToken, {
            httpOnly: true,
            maxAge: 86400000
        }
        ).status(200).json({username, userId, password, accessToken})

        infoLogger.info("Successfully Logged in")
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            msg: 'Unauthenticated'
        });
    }
}

//verify
export const verifyUser = async(req, res) => {
    try{
        //return user object
        res.json(req.user)
        infoLogger.info("verified")
        infoLogger.info(user.rows)
    } catch(error){
        console.log(error.message);
        res.status(500).send({
            msg: 'Unauthenticated'
        });
    }
}