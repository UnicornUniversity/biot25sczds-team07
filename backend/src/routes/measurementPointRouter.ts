import { NextFunction, Response, Router } from 'express';

import dayjs from "dayjs"
import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";

import { AuthorizationRequest, authorizeJWTToken } from '../authorization/authorizeUser';
import { isUserAdmin, validateUserHasAdminAccessToOrg } from '../helpers/helpers';
import MeasurementPoint from '../models/MeasurementPoint';
import { Senzor } from '../models/MeasurementPoint';

import { MeasurementPointAddRequest, measurementPointAddValidator } from '../validators/measurementPoint/measurementPointAdd.validator';
import { MeasurementPointDeleteRequest, measurementPointDeleteValidator } from '../validators/measurementPoint/measurementPointDelete.validator';
import { MeasurementPointListRequest, measurementPointListValidator } from '../validators/measurementPoint/measurementPointList.validator';
import { MeasurementPointUpdateRequest, measurementPointUpdateValidator } from '../validators/measurementPoint/measurementPointUpdate.validator';

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
        try {
            const userHasAccess = await validateUserHasAdminAccessToOrg(userId, organisationId);
            if (userHasAccess.code === 500 || userHasAccess.code === 404) {
                const isAppAdmin = await isUserAdmin(userId);
                if (!isAppAdmin) {
                    req.errorMap[userHasAccess.code] = userHasAccess.message;
                    res.status(userHasAccess.code).json({ errorMap: req.errorMap });
                    return;
                }
            }

            const newMeasurementPoint = {
                organisationId,
                name,
                description,
                creatorId: req.userId as string,
                senzors: [],
                createdEpoch: dayjs().unix(), // Current timestamp in seconds
                updatedEpoch: dayjs().unix(), // Initialy same as createdEpoch
            };
            const result = await collections.measurementPoints.insertOne(newMeasurementPoint);
            if (result.acknowledged) {
                const createdMeasurementPoint = await collections.measurementPoints.findOne({ _id: result.insertedId });
                if (createdMeasurementPoint) {
                    res.status(201).json({ ...createdMeasurementPoint, errorMap: req.errorMap });
                } else {
                    res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Failed to fetch the created document" } });
                }
            } else {
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Insert operation failed" } });
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

        try {
            const userHasAccess = await validateUserHasAdminAccessToOrg(userId, organisationId);
            if (userHasAccess.code === 500 || userHasAccess.code === 404) {
                const isAppAdmin = await isUserAdmin(userId);
                if (!isAppAdmin) {
                    req.errorMap[userHasAccess.code] = userHasAccess.message;
                    res.status(userHasAccess.code).json({ errorMap: req.errorMap });
                    return;
                }
            }

            const result = await collections.measurementPoints.deleteOne({ _id: new ObjectId(id) });
            if (result.acknowledged) {
                res.status(202).json({ errorMap: req.errorMap });
            } else {
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Delete operation failed" } });
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

        const id = req?.params?.id;
        const userId = req.userId ?? "";

        const query = { _id: new ObjectId(id), }

        try {
            const measurementPoint = await collections.measurementPoints.findOne(query);
            if (!measurementPoint) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Unable to find matching Measurement Point with id: ${id}` } });
                return;
            }

            const userIsInOrg = await collections.organisations.findOne({
                _id: measurementPoint.organisationId,
                users: {
                    $elementMatch: { id: userId }
                }
            })
            if (!userIsInOrg) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Unable to find matching Measurement Point with id: ${id}` } });
                return;
            }

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

        const { organisationId, pageInfo = { pageIndex: 0, pageSize: 10 }, order = "decs" } = req.body
        const userId = req.userId ?? "";
        try {
            const userIsInOrg = await collections.organisations.findOne({
                _id: new ObjectId(organisationId),
                users: {
                    $elementMatch: { id: userId }
                }
            })
            if (!userIsInOrg) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Unable to find matching Organisation with id: ${organisationId}` } });
                return;
            }

            const queryFilter = [
                // Match documents based on the filtering conditions
                {
                    organisationId,
                },
                {
                    $facet: {
                        totalCount: [{ $count: "count" }], // Count total matching documents
                        paginatedResults: [
                            { $sort: { name: (order === "decs" ? -1 : 1) } }, // Sort by name field
                            { $skip: pageInfo.pageIndex * pageInfo.pageSize }, // Skip for pagination
                            { $limit: pageInfo.pageSize }, // Limit to page size
                        ],
                    },
                },
            ];


            const measurementPoints = await collections.measurementPoints.aggregate(queryFilter).toArray();
            const totalCount = measurementPoints[0]?.totalCount[0]?.count || 0; // Total count of matching documents
            const paginatedResults: (MeasurementPoint & { _id: ObjectId })[] = measurementPoints[0]?.paginatedResults || []; // Paginated results

            if (Array.isArray(paginatedResults)) {
                // const listsWithUncheckedItems: (ShoppingList & { numberOfUncheckedItems: number })[] = [];
                // for (const list of paginatedResults) {
                //     if (!list._id) { continue; }
                //     const uncheckedItemsCount = await getListUncheckedItemsCount(list._id);
                //     // console.log(`unchecked items for listId: ${list._id} - ${uncheckedItemsCount}`)
                //     if (uncheckedItemsCount < numberOfUncheckedItems) {
                //         // console.log("not pushing the list to result");
                //         continue;
                //     }
                //     listsWithUncheckedItems.push({ ...list, numberOfUncheckedItems: uncheckedItemsCount });
                // }
                res.status(200).json({ measurementPoints: paginatedResults, pageInfo: { ...pageInfo, total: totalCount } });
            } else {
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Failed to fetch the Measurement Points" } });
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

        const { id, name = "", description = "", senzors } = req.body;
        const userId = req.userId ?? "";
        const query = { _id: new ObjectId(id) };
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
            const updateFields: { updatedEpoch: number, name?: string, description?: string, senzors?: Senzor[] } = { updatedEpoch: dayjs().unix() };
            if (name) { updateFields.name = name; }
            if (description) { updateFields.description = description; }
            if (senzors) {
                const senzorIds = senzors.map((sensor) => sensor.sensorId);
                if (senzorIds.length !== new Set(senzorIds).size) {
                    req.errorMap[400] = `Each sensor in sensors Array must have unique sensorId.`
                    res.status(400).json({ erroMap: req.errorMap });
                    return;
                }
                updateFields.senzors = senzors.map((sen) => {
                    const oldSensor: Senzor | undefined = measurementPoint.senzors.find((odlSen: Senzor) => odlSen.sensorId === sen.sensorId)
                    if (!oldSensor) { return sen; }
                    return {
                        ...sen,
                        config: (sen.config.epochCreated > oldSensor.config.epochCreated) ? sen.config : oldSensor.config
                    }
                });
            }

            const result = await collections.measurementPoints.updateOne(query, { $set: updateFields });
            if (result.modifiedCount < 1) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["500"]: `Failed to update Measurement Point` } });
                return;
            }
            const updatedMeasurementPoint = await collections.measurementPoints.findOne(query);
            if (updatedMeasurementPoint) {
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

export default measurementPointRouter;