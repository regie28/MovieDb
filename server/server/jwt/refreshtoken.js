import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const refreshToken = (id, role) => {
    return jwt.sign({id, role}, process.env.TokenJWT, {expiresIn: '1d'});
}