import { NextFunction, Response, Router } from 'express';

import dayjs from "dayjs"
import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";

import { AuthorizationRequest, authorizeJWTToken } from '../authorization/authorizeUser';
import { isUserAdmin, validateUserHasAdminAccessToOrg } from '../helpers/helpers';
import MeasurementPoint from '../models/MeasurementPoint';
import { Sensor } from '../models/MeasurementPoint';

import { MeasurementPointAddRequest, measurementPointAddValidator } from '../validators/measurementPoint/measurementPointAdd.validator';
import { MeasurementPointDeleteRequest, measurementPointDeleteValidator } from '../validators/measurementPoint/measurementPointDelete.validator';
import { MeasurementPointListRequest, measurementPointListValidator } from '../validators/measurementPoint/measurementPointList.validator';
import { MeasurementPointUpdateRequest, measurementPointUpdateValidator } from '../validators/measurementPoint/measurementPointUpdate.validator';
import { generateMpToken } from '../authorization/authorizeMeasurementPoint';
import { MeasurementPointGetJwtTokenRequest, measurementPointGetJwtTokenValidator } from '../validators/measurementPoint/measurementPointGetJwtToken.validator';
import { Policy } from '../models/Organisation';

const measurementPointRouter = Router();

measurementPointRouter.post(
    "/add",
    authorizeJWTToken,
    measurementPointAddValidator,
    async (req: MeasurementPointAddRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.organisations || !collections.measurementPoints) {
            console.warn("DB Collection Organisations or MeasurementPoints has not been initilized.");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const { organisationId, name, description = "" } = req.body;
        const userId = req.userId ?? "";

        const organisationObjectId = new ObjectId(organisationId)
        try {
            const userHasAccess = await validateUserHasAdminAccessToOrg(userId, organisationObjectId);
            if (userHasAccess.code === 500 || userHasAccess.code === 404) {
                const isAppAdmin = await isUserAdmin(userId);
                if (!isAppAdmin) {
                    req.errorMap[userHasAccess.code] = userHasAccess.message;
                    res.status(userHasAccess.code).json({ errorMap: req.errorMap });
                    return;
                }
            }

            const newMeasurementPoint: MeasurementPoint = {
                organisationId: organisationObjectId,
                name,
                description,
                ownerId: String(req.userId),
                sensors: [],
                jwtToken: "",
                created: dayjs().unix(),
            };
            const result = await collections.measurementPoints.insertOne(newMeasurementPoint);
            if (!result.acknowledged) {
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Insert operation failed" } });
                return;
            }

            const mpJwtToken = generateMpToken({ _id: result.insertedId.toString() });
            const addTokenToMpResult = await collections.measurementPoints.updateOne(
                { _id: result.insertedId },
                { $set: { jwtToken: mpJwtToken } }
            );
            if (addTokenToMpResult.modifiedCount < 1) {
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Failed to generate Access JWT token for created measurement point" } });
                return;
            }

            const createdMeasurementPoint = await collections.measurementPoints.findOne(
                { _id: result.insertedId, },
                { projection: { jwtToken: 0 } }
            );
            if (createdMeasurementPoint) {
                res.status(201).json({ ...createdMeasurementPoint, errorMap: req.errorMap });
                return;
            }
            res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Failed to fetch the created document" } });
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
measurementPointRouter.post(
    "/delete",
    authorizeJWTToken,
    measurementPointDeleteValidator,
    async (req: MeasurementPointDeleteRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.measurementPoints || !collections.organisations) {
            console.warn("DB Collection MeasurementPoints has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }
        const { organisationId, id } = req.body;
        const userId = req.userId ?? "";

        const organisationObjectId = new ObjectId(organisationId)
        try {
            const userHasAccess = await validateUserHasAdminAccessToOrg(userId, organisationObjectId);
            if (userHasAccess.code === 500 || userHasAccess.code === 404) {
                const isAppAdmin = await isUserAdmin(userId);
                if (!isAppAdmin) {
                    req.errorMap[userHasAccess.code] = userHasAccess.message;
                    res.status(userHasAccess.code).json({ errorMap: req.errorMap });
                    return;
                }
            }

            const result = await collections.measurementPoints.updateOne(
                {
                    _id: new ObjectId(id),
                    deleted: { $exists: false }
                },
                { $set: { deleted: dayjs().unix() } }
            );
            if (result.acknowledged) {
                res.status(202).json({ errorMap: req.errorMap });
                return;
            }

            res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Delete operation failed" } });

        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: error.message } });
            } else {
                console.error("An unknown error occurred", error);
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "An unknown error occurred" } });
            }
        }
    }
);

measurementPointRouter.get(
    "/get/:id",
    authorizeJWTToken,
    // getListValidator,
    async (req: AuthorizationRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.measurementPoints || !collections.organisations) {
            console.warn("DB Collection MeasurementPoints or Organisations has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const id = req?.params?.id ?? "";
        const userId = req.userId ?? "";

        try {
            const measurementPoint = await collections.measurementPoints.findOne(
                {
                    _id: new ObjectId(id),
                    deleted: { $exists: false },
                },
                {
                    projection: { jwtToken: 0 }
                }
            );
            if (!measurementPoint) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Unable to find matching Measurement Point with id: ${id}` } });
                return;
            }

            const userIsInOrg = await collections.organisations.findOne({
                _id: new ObjectId(measurementPoint.organisationId),
                deleted: { $exists: false },
                "users.id": new ObjectId(userId),
            })
            if (!userIsInOrg) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Unable to find matching Measurement Point with id: ${id}` } });
                return;
            }
            measurementPoint.sensors = measurementPoint.sensors.filter((sensor) => {
                return !sensor.deleted;
            })

            res.status(200).json({ ...measurementPoint, errorMap: req.errorMap });
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: error.message } });
            } else {
                console.error("An unknown error occurred", error);
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "An unknown error occurred" } });
            }
        }
    }
);

measurementPointRouter.post(
    "/list",
    authorizeJWTToken,
    measurementPointListValidator,
    async (req: MeasurementPointListRequest, res: Response) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.measurementPoints || !collections.organisations) {
            console.warn("DB Collection MeasurementPoints or Organisations has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const { organisationId, pageInfo = { pageIndex: 0, pageSize: 10 }, order = "desc" } = req.body;
        const organisationObjectId = new ObjectId(organisationId);
        const userId = req.userId ?? "";
        try {
            const userIsInOrg = await collections.organisations.findOne({
                _id: organisationObjectId,
                deleted: { $exists: false },
                "users.id": new ObjectId(userId),
            },)
            if (!userIsInOrg) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Unable to find matching Organisation with id: ${organisationId}` } });
                return;
            }

            const measurementPoints = await collections.measurementPoints
                .aggregate([
                    {
                        $match: {
                            deleted: { $exists: false },
                            organisationId: organisationObjectId,
                        }
                    },
                    {
                        $facet: {
                            totalCount: [{ $count: "count" }], // Count total matching documents
                            paginatedResults: [
                                { $sort: { name: (order === "desc" ? -1 : 1) } }, // Sort by name field
                                { $skip: pageInfo.pageIndex * pageInfo.pageSize }, // Skip for pagination
                                { $limit: pageInfo.pageSize }, // Limit to page size
                                { $project: { jwtToken: 0 } }
                            ],
                        },
                    },
                ])
                .toArray();
            const totalCount = measurementPoints[0]?.totalCount[0]?.count || 0; // Total count of matching documents
            const paginatedResults: (MeasurementPoint & { _id: ObjectId })[] = measurementPoints[0]?.paginatedResults || []; // Paginated results
            const measurementPointsWithSensors = paginatedResults.map((mp) => {
                mp.sensors = mp.sensors.filter((sensor) => {
                    return !sensor.deleted;
                })
                return mp;
            })
            if (Array.isArray(measurementPointsWithSensors)) {
                res.status(200).json({ measurementPoints: measurementPointsWithSensors, pageInfo: { ...pageInfo, total: totalCount } });
                return;
            }
            res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Failed to fetch the Measurement Points" } });
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: error.message } });
            } else {
                console.error("An unknown error occurred", error);
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "An unknown error occurred" } });
            }
        }
    }
);

measurementPointRouter.post(
    "/update",
    authorizeJWTToken,
    measurementPointUpdateValidator,
    async (req: MeasurementPointUpdateRequest, res: Response) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.measurementPoints) {
            console.warn("DB Collection MeasurementPoints has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const { id, name = "", description = "" } = req.body;
        const userId = req.userId ?? "";
        const query = {
            _id: new ObjectId(id),
            deleted: { $exists: false },
        };
        try {
            const measurementPoint = await collections.measurementPoints.findOne(query);
            if (!measurementPoint) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Unable to find matching Measurement Point with id: ${id}` } });
                return;
            }

            const userHasAccess = await validateUserHasAdminAccessToOrg(userId, measurementPoint.organisationId);
            if (userHasAccess.code === 500 || userHasAccess.code === 404) {
                const isAppAdmin = await isUserAdmin(userId);
                if (!isAppAdmin) {
                    req.errorMap[userHasAccess.code] = userHasAccess.message;
                    res.status(userHasAccess.code).json({ errorMap: req.errorMap });
                    return;
                }
            }

            // Define the update fields
            const updateFields: {
                updated: number,
                name?: string,
                description?: string,
                sensors?: Sensor[]
            } = { updated: dayjs().unix() };
            if (name) { updateFields.name = name; }
            if (description) { updateFields.description = description; }
            // if (sensors) {
            //     const senzorIds = sensors.map((sensor) => sensor.sensorId);
            //     if (senzorIds.length !== new Set(senzorIds).size) {
            //         req.errorMap[400] = `Each sensor in sensors Array must have unique sensorId.`
            //         res.status(400).json({ erroMap: req.errorMap });
            //         return;
            //     }
            //     updateFields.sensors = sensors.map((sen) => {
            //         const newSensor: Sensor = { ...sen };
            //         const oldSensor = measurementPoint.sensors.find((odlSen: Sensor) => odlSen.sensorId === sen.sensorId)
            //         if (!oldSensor) { return newSensor; }
            //         return {
            //             ...newSensor,
            //             config: (sen.config.created > oldSensor.config.created) ? sen.config : oldSensor.config
            //         }
            //     });
            // }

            const result = await collections.measurementPoints.updateOne(query, { $set: updateFields });
            if (result.modifiedCount < 1) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["500"]: `Failed to update Measurement Point` } });
                return;
            }
            const updatedMeasurementPoint = await collections.measurementPoints.findOne(
                query,
                {
                    projection: { jwtToken: 0 }
                },
            );
            if (updatedMeasurementPoint) {
                updatedMeasurementPoint.sensors = updatedMeasurementPoint.sensors.filter((sensor) => {
                    return !sensor.deleted;
                })
                res.status(200).json({ ...updatedMeasurementPoint, errorMap: req.errorMap });
            } else {
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Failed to fetch the updated Measurement Point" } });
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: error.message } });
            } else {
                console.error("An unknown error occurred", error);
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "An unknown error occurred" } });
            }
        }
    }
);

measurementPointRouter.get(
    "/getJwtToken",
    authorizeJWTToken,
    measurementPointGetJwtTokenValidator,
    async (req: MeasurementPointGetJwtTokenRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.measurementPoints || !collections.organisations) {
            console.warn("DB Collection MeasurementPoints or Organisations has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }
        const userId = req.userId ?? "";
        const { _id } = req.body;

        try {
            const measurementPoint = await collections.measurementPoints.findOne(
                {
                    _id: new ObjectId(_id),
                    deleted: { $exists: false },
                },
            );
            if (!measurementPoint) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Unable to find matching Measurement Point with id: ${_id}` } });
                return;
            }

            const userIsInOrg = await collections.organisations.findOne({
                _id: new ObjectId(measurementPoint.organisationId),
                deleted: { $exists: false },
                "users.id": new ObjectId(userId),
                "users.policy": Policy.Admin,
            })
            if (!userIsInOrg) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Unable to find matching Measurement Point with id: ${_id}` } });
                return;
            }

            res.status(200).json({
                jwtToken: measurementPoint.jwtToken,
                errorMap: req.errorMap
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: error.message } });
            } else {
                console.error("An unknown error occurred", error);
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "An unknown error occurred" } });
            }
        }
    }
);

export default measurementPointRouter;