import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

import { Request } from 'express';
import { ErrorMap } from '../types/customTypes';

export const generateToken = (user: { id: string }) => {
    const secretToken = process.env.ACCESS_TOKEN_SECRET;
    if (!secretToken) {
        throw new Error("Internal server error: Secret token not found");
    }

    const token = jwt.sign(
        user,
        secretToken,
        { expiresIn: '3h' } // Token expires in 1 hour
    );

    return token;
};


export const verifyToken = async (token: string) => {
    const secretToken = process.env.ACCESS_TOKEN_SECRET;
    if (!secretToken) { return 500; }

    try {
        const result = jwt.verify(token, secretToken);
        console.log("verifyToken - result: ", String(result))
        if (typeof result === "string") {
            return 403;
        }
        return result.id as string;
    } catch (err) {
        console.error("verifyToken - error: ", err);
        return 403;
    }
}

export interface AuthorizationRequest extends Request {
    userId?: string,
    errorMap?: ErrorMap,
}
export const authorizeJWTToken = async (
    req: AuthorizationRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.sendStatus(403); // Unauthorized if no token is present
        return;
    }

    const verifiedUser = await verifyToken(token);
    if (verifiedUser === 500) {
        res.sendStatus(500).json("Internal server errror");
        return;
    }
    if (verifiedUser === 403) {
        res.sendStatus(403)
        return;
    }

    req.userId = verifiedUser;
    next();
};