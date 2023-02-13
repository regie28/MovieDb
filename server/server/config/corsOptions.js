import { allowedOrigins } from "./allowed.js"

export const corsOptions = {
    origin: (origin, callback)=>{
        if(allowedOrigins.indexOf(origin) !== -1 || origin){
            callback(null,true);
        } 
        else {
            callback(new Error(`The CORS policy for this site does not '+' allow access from the specified Origin.`));
        }
        },
        credentials: true,
        optionSuccessStatus: 200
    }