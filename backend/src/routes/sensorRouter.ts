import { NextFunction, Response, Router } from 'express';
import { Filter, ObjectId } from 'mongodb';
import dayjs from 'dayjs';

import { collections } from '../services/database.service';
import MeasurementPoint, { Sensor } from '../models/MeasurementPoint';
import { sensorGetConfiguratinValidator, SensorGetRequest } from '../validators/measurementPoint/sensor/sensorGet.validator';

import { authorizeJWTToken } from '../authorization/authorizeUser';

import { SensorUpdateRequest, sensorUpdateValidator } from '../validators/measurementPoint/sensor/sensorUpdate.schema.validator';
import { SensorDeleteRequest, sensorDeleteValidator } from '../validators/measurementPoint/sensor/sensorDelete.schema.validator';
import { SensorAddRequest, sensorAddValidator } from '../validators/measurementPoint/sensor/sensorAdd.schema.validator';
import { authorizeMpJWTToken } from '../authorization/authorizeMeasurementPoint';
import { SensorGetConfigurationRequest, sensorGetConfigValidator } from '../validators/measurementPoint/sensor/sensorGetConfig.validator';
import { SensorUpdateConfigRequest, sensorUpdateConfigValidator } from '../validators/measurementPoint/sensor/sensorUpdateConfig.schema.validator';

const sensorRouter = Router();

sensorRouter.get(
    "/:sensorId",
    authorizeJWTToken,
    sensorGetConfiguratinValidator,
    async (req: SensorGetRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.measurementPoints) {
            console.warn("DB Collection MeasurementPoints has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        console.log("measuringRouter/configuration/:sensorId - req.params: ", req.params);
        const { sensorId } = req.params;
        const { measurementPoinId } = req.query;
        const filter: Filter<MeasurementPoint> = {
            deleted: { $exists: false },
            sensors: {
                $elemMatch: {
                    sensorId: sensorId,
                    deleted: { $exists: false }
                }
            }
        }
        if (typeof measurementPoinId === "string") {
            filter._id = new ObjectId(measurementPoinId)
        }

        try {
            const measurementPoint = await collections.measurementPoints.findOne(filter);
            if (!measurementPoint) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }

            const sensor = measurementPoint.sensors.find((sen: Sensor) => sen.sensorId === sensorId);
            if (!sensor) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }

            res.status(200).json({ ...sensor, errorMap: req.errorMap })
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


sensorRouter.post(
    "/add",
    authorizeJWTToken,
    sensorAddValidator,
    async (req: SensorAddRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.measurementPoints) {
            console.warn("DB Collection MeasurementPoints has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const { measurementPointId, ...sensorToAdd } = req.body;
        const mpId = new ObjectId(measurementPointId);
        try {
            const measurementPoint = await collections.measurementPoints.findOne({
                _id: mpId,
                deleted: { $exists: false },
            });
            if (!measurementPoint) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Measurement point with this measurementPointId: ${measurementPointId} was not found.` } });
                return;
            }

            const created = dayjs().unix();
            measurementPoint.sensors.push({
                ...sensorToAdd,
                sensorId: new ObjectId().toString(),
                created,
                config: {
                    ...sensorToAdd.config,
                    created,
                }
            })

            const result = await collections.measurementPoints.updateOne(
                { _id: measurementPoint._id },
                {
                    $set: {
                        sensors: measurementPoint.sensors
                    }
                }
            );
            if (result.modifiedCount < 1) {
                req.errorMap["500"] = `Failed to add Sensor to Measurement Point with id: ${measurementPointId}`;
                res.status(500).json({ errorMap: req.errorMap });
                return;
            }
            const measurementPointUpdated = await collections.measurementPoints.findOne(
                {
                    _id: mpId,
                    deleted: { $exists: false },
                },
                {
                    projection: { jwtToken: 0 }
                },
            );
            res.status(200).json({ ...measurementPointUpdated, errorMap: req.errorMap });
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

sensorRouter.post(
    "/update",
    authorizeJWTToken,
    sensorUpdateValidator,
    async (req: SensorUpdateRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.measurementPoints) {
            console.warn("DB Collection Users has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const { measurementPointId, sensorId, name, quantity, config } = req.body;
        try {
            const measurementPoint = await collections.measurementPoints.findOne({
                _id: new ObjectId(measurementPointId),
                deleted: { $exists: false },
                sensors: {
                    $elemMatch: {
                        sensorId: sensorId,
                        deleted: { $exists: false }
                    }
                }
            });

            if (!measurementPoint) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }
            const sensorIndex: number = measurementPoint.sensors.findIndex((sen: Sensor) => sen.sensorId === sensorId && !sen.deleted);
            if (sensorIndex === -1) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }

            const newSensors = [...measurementPoint.sensors];
            const updatedSensor = newSensors[sensorIndex];
            if (name) { updatedSensor.name = name }
            if (quantity) { updatedSensor.quantity = quantity; }
            if (config) {
                updatedSensor.config = {
                    ...config,
                    created: dayjs().unix()
                }
            }

            const result = await collections.measurementPoints.updateOne(
                { _id: measurementPoint._id },
                {
                    $set: {
                        sensors: newSensors
                    }
                }
            );

            if (result.modifiedCount > 0) {
                const measurementPointUpdated = await collections.measurementPoints.findOne(
                    {
                        _id: measurementPoint._id,
                        deleted: { $exists: false },
                    },
                    {
                        projection: { jwtToken: 0 }
                    },
                );
                res.status(200).json({ ...measurementPointUpdated, errorMap: req.errorMap });
                return;
            }
            req.errorMap["500"] = `Failed to update Configuration of Sensor with id: ${sensorId}`;
            res.status(500).json({ errorMap: req.errorMap });
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


sensorRouter.post(
    "/delete",
    authorizeJWTToken,
    sensorDeleteValidator,
    async (req: SensorDeleteRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.measurementPoints) {
            console.warn("DB Collection Users has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const { measurementPointId, sensorId } = req.body;
        try {
            const measurementPoint = await collections.measurementPoints.findOne({
                _id: new ObjectId(measurementPointId),
                deleted: { $exists: false },
                sensors: {
                    $elemMatch: {
                        sensorId: sensorId,
                        deleted: { $exists: false }
                    }
                }
            });

            if (!measurementPoint) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }
            const sensorIndex: number = measurementPoint.sensors.findIndex((sen: Sensor) => sen.sensorId === sensorId);
            if (sensorIndex === -1) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }

            const newSensors = measurementPoint.sensors.map((sensor) => {
                if (sensor.sensorId === sensorId) {
                    return { ...sensor, deleted: dayjs().unix() }
                }
                return sensor;
            });

            const result = await collections.measurementPoints.updateOne(
                { _id: measurementPoint._id },
                {
                    $set: {
                        sensors: newSensors
                    }
                }
            );

            if (result.modifiedCount > 0) {
                res.status(202).json({ errorMap: req.errorMap });
                return;
            }
            req.errorMap["500"] = `Failed to update Configuration of Sensor with id: ${sensorId}`;
            res.status(500).json({ errorMap: req.errorMap });
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

sensorRouter.post(
    "/update",
    authorizeJWTToken,
    sensorUpdateValidator,
    async (req: SensorUpdateRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.measurementPoints) {
            console.warn("DB Collection Users has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const { measurementPointId, sensorId, name, quantity, config } = req.body;
        try {
            const measurementPoint = await collections.measurementPoints.findOne({
                _id: new ObjectId(measurementPointId),
                deleted: { $exists: false },
                sensors: {
                    $elemMatch: {
                        sensorId: sensorId,
                        deleted: { $exists: false }
                    }
                }
            });

            if (!measurementPoint) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }
            const sensorIndex: number = measurementPoint.sensors.findIndex((sen: Sensor) => sen.sensorId === sensorId && !sen.deleted);
            if (sensorIndex === -1) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }

            const newSensors = [...measurementPoint.sensors];
            const updatedSensor = newSensors[sensorIndex];
            if (name) { updatedSensor.name = name }
            if (quantity) { updatedSensor.quantity = quantity; }
            if (config) {
                updatedSensor.config = {
                    ...config,
                    created: dayjs().unix()
                }
            }

            const result = await collections.measurementPoints.updateOne(
                { _id: measurementPoint._id },
                {
                    $set: {
                        sensors: newSensors
                    }
                }
            );

            if (result.modifiedCount > 0) {
                const measurementPointUpdated = await collections.measurementPoints.findOne(
                    {
                        _id: measurementPoint._id,
                        deleted: { $exists: false },
                    },
                    {
                        projection: { jwtToken: 0 }
                    },
                );
                res.status(200).json({ ...measurementPointUpdated, errorMap: req.errorMap });
                return;
            }
            req.errorMap["500"] = `Failed to update Configuration of Sensor with id: ${sensorId}`;
            res.status(500).json({ errorMap: req.errorMap });
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

sensorRouter.post(
    "/updateConfig",
    authorizeMpJWTToken,
    sensorUpdateConfigValidator,
    async (req: SensorUpdateConfigRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.measurementPoints) {
            console.warn("DB Collection Users has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const { measurementPointId, sensorId, jwtToken, config } = req.body;
        try {
            const measurementPoint = await collections.measurementPoints.findOne({
                _id: new ObjectId(measurementPointId),
                deleted: { $exists: false },
                jwtToken: jwtToken,
                sensors: {
                    $elemMatch: {
                        sensorId: sensorId,
                        deleted: { $exists: false }
                    }
                }
            });

            if (!measurementPoint) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }
            const sensorIndex: number = measurementPoint.sensors.findIndex((sen: Sensor) => sen.sensorId === sensorId && !sen.deleted);
            if (sensorIndex === -1) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }

            const newSensors = [...measurementPoint.sensors];
            const updatedSensor = newSensors[sensorIndex];
            updatedSensor.config = {
                ...config,
                created: dayjs().unix()
            }
            const result = await collections.measurementPoints.updateOne(
                { _id: measurementPoint._id },
                {
                    $set: {
                        sensors: newSensors
                    }
                }
            );

            if (result.modifiedCount > 0) {
                const measurementPointUpdated = await collections.measurementPoints.findOne(
                    {
                        _id: measurementPoint._id,
                        deleted: { $exists: false },
                    },
                    {
                        projection: { jwtToken: 0 }
                    },
                );
                res.status(200).json({ ...measurementPointUpdated?.sensors[sensorIndex].config, errorMap: req.errorMap });
                return;
            }
            req.errorMap["500"] = `Failed to update Configuration of Sensor with id: ${sensorId}`;
            res.status(500).json({ errorMap: req.errorMap });
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


sensorRouter.post(
    "/getConfig",
    authorizeMpJWTToken,
    sensorGetConfigValidator,
    async (req: SensorGetConfigurationRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.measurementPoints) {
            console.warn("DB Collection Users has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const { measurementPointId, sensorId, jwtToken, } = req.body;
        try {
            const measurementPoint = await collections.measurementPoints.findOne({
                _id: new ObjectId(measurementPointId),
                deleted: { $exists: false },
                jwtToken: jwtToken,
                sensors: {
                    $elemMatch: {
                        sensorId: sensorId,
                        deleted: { $exists: false }
                    }
                }
            });

            if (!measurementPoint) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }
            const sensorIndex: number = measurementPoint.sensors.findIndex((sen: Sensor) => sen.sensorId === sensorId && !sen.deleted);
            if (sensorIndex === -1) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Sensor with this sensorId: ${sensorId} was not found.` } });
                return;
            }

            res.status(200).json({ ...measurementPoint.sensors[sensorIndex].config, errorMap: req.errorMap });
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


export default sensorRouter;
