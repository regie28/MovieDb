import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

//Issue a JWT request
export const generateJWT = (email) => {
    return jwt.sign(email, process.env.JWT_SECRET_KEY,{expiresIn: "1hr"})
};