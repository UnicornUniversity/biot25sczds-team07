import { NextFunction, Response, Router } from 'express';

import { collections } from '../services/database.service';

import { MeasuringGetConfigurationRequest, measuringGetConfigurationValidator } from '../validators/measuring/measuringGetConfiguration.validator';
import { Senzor } from '../models/MeasurementPoint';
import { MeasuringUpdateConfigurationRequest, measuringUpdateConfigurationValidator } from '../validators/measuring/measuringUpdateConfiguration.validator';
import { validateAddData } from '../validators/measuring/dataAdd.schema';
import { DataAddRequest, dataAddValidator } from '../validators/measuring/dataAdd.validator';

const measuringRouter = Router();


measuringRouter.get(
    "/configuration/:sensorId",
    // authorizeJWTToken,
    measuringGetConfigurationValidator,
    async (req: MeasuringGetConfigurationRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.measurementPoints) {
            console.warn("DB Collection MeasurementPoints has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        console.log("measuringRouter/configuration/:sensorId - req.params: ", req.params);
        const { sensorId } = req.params;

        try {
            const measurementPoint = await collections.measurementPoints.findOne({
                senzors: {
                    $elemMatch: {
                        sensorId: sensorId
                    }
                }
            });
            if (!measurementPoint) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }

            const senzor = measurementPoint.senzors.find((sen: Senzor) => sen.sensorId === sensorId);
            if (!senzor) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }

            res.status(200).json({ name: senzor.name, quantity: senzor.quantity, config: senzor.config, errorMap: req.errorMap })
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


measuringRouter.post(
    "/configuration/update",
    measuringUpdateConfigurationValidator,
    async (req: MeasuringUpdateConfigurationRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.measurementPoints) {
            console.warn("DB Collection Users has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const { sensorId, config } = req.body;
        try {
            const measurementPoint = await collections.measurementPoints.findOne({
                senzors: {
                    $elemMatch: {
                        sensorId: sensorId
                    }
                }
            });
            if (!measurementPoint) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }

            const senzorIndex: number = measurementPoint.senzors.findIndex((sen: Senzor) => sen.sensorId === sensorId);
            if (senzorIndex === -1) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }

            const newSensor = [...measurementPoint.sensors];
            newSensor[senzorIndex].config = config;

            const result = await collections.measurementPoints.updateOne(
                { _id: measurementPoint._id },
                {
                    $set: {
                        senzors: newSensor
                    }
                }
            );

            if (result.modifiedCount > 0) {
                res.status(200).json({ ...config, errorMap: req.errorMap });
            } else {
                req.errorMap["500"] = `Failed to update Configuration of Sensor with id: ${sensorId}`;
                res.status(500).json({ errorMap: req.errorMap });
                return;
            }
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


measuringRouter.post(
    "/sendData",
    dataAddValidator,
    async (req: DataAddRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.measurementPoints) {
            console.warn("DB Collection Users has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const { sensorId, tempData } = req.body;
        try {
            const measurementPoint = await collections.measurementPoints.findOne({
                senzors: {
                    $elemMatch: {
                        sensorId: sensorId
                    }
                }
            });
            if (!measurementPoint) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }

            console.log("/sendData - tempData: ", tempData);
            // TODO - send data into influx DB
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