import { NextFunction, Response, Router } from 'express';

import { collections } from '../services/database.service';

import { DataAddRequest, dataAddValidator } from '../validators/measuring/dataAdd.validator';
import { ObjectId } from 'mongodb';
import { validateMeasurementPointGetJwtToken } from '../validators/measurementPoint/measurementPointGetJwtToken.schema';
import { authorizeMpJWTToken } from '../authorization/authorizeMeasurementPoint';

const measuringRouter = Router();

measuringRouter.post(
    "/sendData",
    authorizeMpJWTToken,
    dataAddValidator,
    async (req: DataAddRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.measurementPoints) {
            console.warn("DB Collection Users has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const { measurementPointId, jwtToken, sensorId, tempData } = req.body;

        try {
            const measurementPoint = await collections.measurementPoints.findOne({
                _id: new ObjectId(measurementPointId),
                jwtToken: jwtToken,
                deleted: { $exists: false },
                sensors: {
                    $elemMatch: {
                        sensorId: sensorId,
                        deleted: { $exists: false },
                    }
                }
            });
            if (!measurementPoint) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }

            console.log("/sendData - tempData: ", tempData);
            // TODO - send data into influx DB
            res.status(200).json({ errorMap: { ...req.errorMap } });
            return;
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: error.message } });
            } else {
                console.error("An unknown error occurred: ", error);
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "An unknown error occurred" } });
            }
        }
    }
);

export default measuringRouter;