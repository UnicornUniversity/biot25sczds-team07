import { NextFunction, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { Request } from 'express';
import { ErrorMap, User } from '../types/customTypes';


export interface AuthorizationRequest extends Request {
    user?: User;
    errorMap?: ErrorMap
}

const isJwtPayload = (payload: string | JwtPayload): payload is JwtPayload => {
    return (payload as JwtPayload).id !== undefined;
}

export const authorizeUser = async (
    req: AuthorizationRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.sendStatus(401); // Unauthorized if no token is present
        return;
    }

    const secretToken = process.env.ACCESS_TOKEN_SECRET;
    if (!secretToken) {
        res.sendStatus(500).json("Internal server errror");
        return;
    }

    jwt.verify(token, secretToken, (err, user) => {
        if (!user) {
            res.sendStatus(403);
            return;
        }

        if (isJwtPayload(user)) {
            if (user.role === "public") {
                res.sendStatus(403);
                return;
            }
            const userObject = {
                id: user.id,
                role: user.role,
                policies: user.policies // Assuming the token contains user policies
            };
            req.user = userObject; // Attach the user object to the request
            req.errorMap = {};
            next();
            return;
        }

        res.sendStatus(403); // Forbidden if token is invalid
        return;
    });
};