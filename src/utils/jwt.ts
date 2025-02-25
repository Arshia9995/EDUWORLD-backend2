import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();


const secret = process.env.JWT_SECRET!;

export const generateToken = (payload: unknown) => {
    console.log('rechead jwt',secret);
    
    return jwt.sign({ payload: payload },secret,{expiresIn: "1d"});
};


export const generateRefreshToken = (payload: unknown) => { 
    return jwt.sign({ payload: payload },secret,{expiresIn: "7d"});
};


export const verifyToken = (token: string): Promise<JwtPayload> => {
    console.log("Reached verify token")
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) reject(err);
            resolve(decoded as JwtPayload);
        });
    });
}


