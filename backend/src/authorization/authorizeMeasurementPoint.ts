import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

import { Request } from 'express';
import { ErrorMap } from '../types/customTypes';

export interface MeasurementPoinToSign { _id: string }
export const generateMpToken = (measurementPoint: MeasurementPoinToSign) => {
    const secretToken = process.env.MEASUREMENT_POINTS_SECRET;
    if (!secretToken) {
        throw new Error("Internal server error: Secret token not found");
    }

    const token = jwt.sign(
        measurementPoint,
        secretToken,
        { expiresIn: 60 }
    );

    return token;
};


// export const verifyMeasurementPointToken = async (token: string) => {
//     const secretToken = process.env.MEASUREMENT_POINTS_SECRET;
//     if (!secretToken) { return 500; }

//     try {
//         const result = jwt.verify(token, secretToken);
//         console.log("verifyToken - result: ", String(result))
//         if (typeof result === "string") {
//             return 403;
//         }
//         const signedMp = result as MeasurementPoinToSign
//         return signedMp._id;
//     } catch (err) {
//         console.error("verifyToken - error: ", err);
//         return 403;
//     }
// }

export interface MpAuthorizationRequest extends Request {
    measurementPointId?: string,
    errorMap?: ErrorMap,
}
export const authorizeMpJWTToken = async (
    req: MpAuthorizationRequest,
    res: Response,
    next: NextFunction
) => {
    next();
    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1];

    // if (!token) {
    //     res.sendStatus(403); // Unauthorized if no token is present
    //     return;
    // }

    // const verifiedNode = await verifyMeasurementPointToken(token);
    // if (verifiedNode === 500) {
    //     res.sendStatus(500).json("Internal server errror");
    //     return;
    // }
    // if (verifiedNode === 403) {
    //     res.sendStatus(403)
    //     return;
    // }

    // req.measurementPointId = verifiedNode;

};