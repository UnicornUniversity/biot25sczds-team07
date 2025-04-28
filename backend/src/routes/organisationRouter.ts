import { NextFunction, Response, Router } from 'express';
import dayjs from 'dayjs';
import { ObjectId } from 'mongodb';

import { authorizeJWTToken } from '../authorization/authorizeUser';
import { collections } from '../services/database.service';

import Organisation, { OrganisationUser, Policy } from '../models/Organisation';

import { OrganisationAddRequest, organisationAddValidator } from '../validators/organisation/organisationAdd.validator';
import { OrganisationDeleteRequest, organisationDeleteValidator } from '../validators/organisation/organisationDelete.validator';
import { OrganisationUpdateRequest, organisationUpdateValidator } from '../validators/organisation/organisationUpdate.validator';
import { OrganisationListRequest, organisationListValidator } from '../validators/organisation/organisationList.validator';
import { isUserAdmin, validateUserHasAdminAccessToOrg } from '../helpers/helpers';


const organisationRouter = Router();


organisationRouter.post(
    "/add",
    authorizeJWTToken,
    organisationAddValidator,
    async (req: OrganisationAddRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.organisations) {
            console.warn("DB Collection Organisations has not been initilized: ");
            const errorMap = req.errorMap ?? {};
            errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        try {
            const { name, description } = req.body;
            const userId = new ObjectId(req.userId ?? "");

            const epochNow = dayjs().unix();

            const newOrganisation: Organisation = {
                name,
                description: description ?? "",
                users: [{ policy: Policy.Admin, id: userId }],
                bucketToken: "", // TODO - add logic for creating bucket Token (will be used by measurment points to insert data into InfluxDB)
                created: epochNow,
            }

            const result = await collections.organisations.insertOne(newOrganisation);
            if (result.acknowledged) {
                const createdOrganisation = await collections.organisations.findOne(
                    { _id: result.insertedId },
                    // {
                    //     projection: {
                    //         _id: 0, // Exclude the original _id field
                    //         id: "$_id", // Include the _id field as id
                    //         name: 1,
                    //         description: 1,
                    //         users: 1,
                    //         bucketToken: 1,
                    //         createdEpoch: 0,
                    //         updatedEpoch: 0,
                    //     },
                    // }
                );
                if (createdOrganisation) {
                    res.status(201).json({ ...createdOrganisation, errorMap: req.errorMap });
                    return;
                }
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Failed to fetch the created Organisation Document" } });
                return;
            }
            res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Insert operation failed" } });
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
organisationRouter.post(
    "/delete",
    authorizeJWTToken,
    organisationDeleteValidator,
    async (req: OrganisationDeleteRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.organisations || !collections.measurementPoints) {
            console.warn("DB Collection Organisations or MeasuementPoints has not been initilized: ");
            const errorMap = req.errorMap ?? {};
            errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        try {
            const organisationId = req.body.id;
            const userId = req.userId ?? "";

            // console.log("organisation/delete - userId: ", userId);

            const organisationObjectId = new ObjectId(organisationId)
            const userHasAccess = await validateUserHasAdminAccessToOrg(userId, organisationObjectId);
            if (userHasAccess.code === 500 || userHasAccess.code === 404) {
                const isAppAdmin = await isUserAdmin(userId);
                if (!isAppAdmin) {
                    req.errorMap[userHasAccess.code] = userHasAccess.message;
                    res.status(userHasAccess.code).json({ errorMap: req.errorMap });
                    return;
                }
            }

            const deleteObjectId = new ObjectId(organisationId);
            const deletedResult = await collections.organisations.updateOne(
                {
                    _id: deleteObjectId,
                    deleted: { $exists: false },
                    users: {
                        $elemMatch: {
                            id: new ObjectId(userId),
                            policy: Policy.Admin
                        }
                    }
                },
                { $set: { deleted: dayjs().unix() } }
            );
            if (deletedResult.modifiedCount < 1) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Organisation with this id: ${organisationId} doesn't exist.` } });
                return;
            }
            if (deletedResult.acknowledged) {
                const deletedMeasurementPoints = await collections.measurementPoints.updateMany(
                    {
                        deleted: { $exists: false },
                        organisationId: deleteObjectId,
                    },
                    { $set: { deleted: dayjs().unix() } }
                );
                res.status(202).json({ errorMap: req.errorMap });
                return;
            }
            res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Delete operation failed" } });
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
organisationRouter.post(
    "/update",
    authorizeJWTToken,
    organisationUpdateValidator,
    async (req: OrganisationUpdateRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.organisations || !collections.users) {
            console.warn("DB Collection Organisations or Users has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        try {
            const { id, name, description, users } = req.body;
            const userId = req.userId ?? "";
            const organisationObjectId = new ObjectId(id)
            const userHasAccess = await validateUserHasAdminAccessToOrg(userId, organisationObjectId);
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
                users?: OrganisationUser[],
            } = { updated: dayjs().unix() };
            if (name) { updateFields.name = name; }
            if (description) { updateFields.description = description }
            if (users) {
                const userIds = users.map(user => new ObjectId(user.id));
                const usersThatExist = await collections.users.find({
                    _id: { $in: userIds },
                    deleted: { $exists: false }
                }).toArray();

                if (usersThatExist.length !== userIds.length) {
                    const nonExistingUsers = userIds.filter((id) => !usersThatExist.some((user) => user._id === id));
                    req.errorMap["400"] = `Invalid users - there are IDs for users that doesnt exists in the DB: ${nonExistingUsers.join(", ")}`;
                    res.status(400).json(req.errorMap);
                    return;
                }
                updateFields.users = users.map((user) => {
                    return {
                        ...user,
                        id: new ObjectId(user.id),
                    }
                });
            }

            const result = await collections.organisations.updateOne(
                {
                    _id: new ObjectId(req.body.id),
                    deleted: { $exists: false },
                    users: {
                        $elemMatch: {
                            id: new ObjectId(userId),
                            policy: Policy.Admin
                        }
                    }
                },
                { $set: updateFields }
            );
            if (result.matchedCount < 1) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `There is no such Organisation with id: ${id}` } });
                return;
            }
            const updatedOrganisation = await collections.organisations.findOne({ _id: new ObjectId(id) });
            if (updatedOrganisation) {
                res.status(200).json({ ...updatedOrganisation, errorMap: req.errorMap });
                return;
            }
            res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Failed to fetch the updated Organisation" } });
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

organisationRouter.get(
    "/get/:id",
    authorizeJWTToken,
    async (req: OrganisationListRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.organisations) {
            console.warn("DB Collection Organisations has not been initilized: ");
            const errorMap = req.errorMap ?? {};
            errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const organisationId = req?.params?.id;
        const userId = req.userId ?? "";

        try {

            const organisation = await collections.organisations.findOne({
                _id: new ObjectId(organisationId),
                deleted: { $exists: false },
                users: {
                    $elemMatch: {
                        id: new ObjectId(userId),
                    }
                }
            });
            if (organisation) {
                res.status(200).json({ ...organisation, errorMap: req.errorMap });
                return;
            }
            res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Unable to find matching Organisation with id: ${organisationId}` } });
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
)

organisationRouter.post(
    "/list",
    authorizeJWTToken,
    organisationListValidator,
    async (req: OrganisationListRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.organisations) {
            console.warn("DB Collection Organisations has not been initilized: ");
            const errorMap = req.errorMap ?? {};
            errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        try {
            const { pageInfo = { pageIndex: 0, pageSize: 20 }, order = "asc" } = req.body;
            const userId = req.userId ?? "";

            const organisations = await collections.organisations
                .aggregate([
                    {
                        $match: {
                            deleted: { $exists: false },
                            "users.id": new ObjectId(userId),
                        }
                    },
                    {
                        $facet: {
                            totalCount: [{ $count: "count" }], // Count total matching documents
                            paginatedResults: [
                                { $sort: { name: (order === "desc" ? -1 : 1) } }, // Sort by name field
                                { $skip: pageInfo.pageIndex * pageInfo.pageSize }, // Skip for pagination
                                { $limit: pageInfo.pageSize }, // Limit to page size
                            ],
                        },
                    },
                ])
                .toArray();
            const totalCount = organisations[0]?.totalCount[0]?.count || 0; // Total count of matching documents
            const paginatedResults = organisations[0]?.paginatedResults || []; // Paginated results

            if (Array.isArray(paginatedResults)) {
                res.status(200).json({ organisations: paginatedResults, pageInfo: { ...pageInfo, total: totalCount } });
                return;
            }
            res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Failed to fetch the organisations" } });
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

export default organisationRouter;