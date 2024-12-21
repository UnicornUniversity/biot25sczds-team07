import { NextFunction, Response, Router } from 'express';
import dayjs from 'dayjs';
import { ObjectId } from 'mongodb';

import { authorizeUser } from '../authorization/authorizeUser';
import { collections } from '../services/database.service';
import { OrganisationAddRequest, organisationAddValidator } from '../validators/organisation/organisationAdd.validator';
import Organisation, { Policy } from '../models/Organisation';


const organisationRouter = Router();


organisationRouter.post(
    "/add",
    authorizeUser,
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
            const userId = req.user?.id ?? "";

            const epochNow = dayjs().unix();

            const newOrganisation: Organisation = {
                name,
                description: description ?? "",
                users: [{ policy: Policy.Admin, id: userId }],
                bucketToken: "", // TODO - add logic for creating bucket Token (will be used by measurment points to insert data into InfluxDB)
                createdEpoch: epochNow,
                updatedEpoch: epochNow,
            }

            const result = await collections.organisations.insertOne(newOrganisation);
            if (result.acknowledged) {
                const createdOrganisation = await collections.organisations.findOne(
                    { _id: result.insertedId },
                    {
                        projection: {
                            _id: 0, // Exclude the original _id field
                            id: "$_id", // Include the _id field as id
                            name: 1,
                            description: 1,
                            users: 1,
                            bucketToken: 1,
                            createdEpoch: 0,
                            updatedEpoch: 0,
                        },
                    }
                );
                if (createdOrganisation) {
                    res.status(201).json({ ...createdOrganisation, errorMap: req.errorMap });
                } else {
                    res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Failed to fetch the created Organisation Document" } });
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
organisationRouter.post(
    "/removeFromList",
    authorizeUser,
    itemRemoveFromListValidator,
    async (req: ItemRemoveFromListRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.items || !collections.shoppingLists) {
            console.warn("DB Collection items has not been initilized: ");
            const errorMap = req.errorMap ?? {};
            errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        try {
            const listId = req.body.listId;
            const userId = req.user?.id ?? "";

            const shoppingList = await collections.shoppingLists.findOne({
                _id: new ObjectId(listId),
                $or: [
                    { ownerId: userId }, // Check if the user is the owner of the list
                    { membersIdList: userId }
                ],
            });
            if (!shoppingList) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Shopping list with this id: ${listId} doesn't exist.` } });
                return;
            }

            const result = await collections.items.deleteOne({ _id: new ObjectId(req.body.id) });
            if (result.acknowledged && result.deletedCount > 0) {
                res.status(202).json({ errorMap: req.errorMap });
            } else if (result.deletedCount < 1) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Item with this id: ${req.body.id} doesn't exists` } });
            } else {
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Delete operation failed" } });
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
organisationRouter.post(
    "/update",
    authorizeUser,
    itemUpdateValidator,
    async (req: ItemUpdateRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.items || !collections.shoppingLists) {
            console.warn("DB Collection items has not been initilized: ");
            const errorMap = req.errorMap ?? {};
            errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        try {
            const listId = req.body.listId;
            const userId = req.user?.id ?? "";

            const shoppingList = await collections.shoppingLists.findOne({
                _id: new ObjectId(listId),
                $or: [
                    { ownerId: userId }, // Check if the user is the owner of the list
                    { membersIdList: userId }
                ],
            });
            if (!shoppingList) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Shopping list with this id: ${listId} doesn't exist.` } });
                return;
            }

            const { id, name, amount, completed } = req.body


            // Define the update fields
            const updateFields: {
                updatedEpoch: number,
                name?: string,
                amount?: number,
                completed?: boolean
            } = { updatedEpoch: dayjs().unix() };
            if (name) { updateFields.name = name; }
            if (typeof amount == "number") { updateFields.amount = amount; }
            if (typeof completed === "boolean") { updateFields.completed = completed; }

            const result = await collections.items.updateOne(
                { _id: new ObjectId(req.body.id) },
                { $set: updateFields }
            );
            if (result.matchedCount === 0) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `There is no such Item with id: ${id}` } });
                return;
            }
            const updatedItem = await collections.items.findOne({ _id: new ObjectId(id) });
            if (updatedItem) {
                res.status(200).json({ ...updatedItem, errorMap: req.errorMap });
            } else {
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Failed to fetch the updated Item" } });
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
organisationRouter.post(
    "/getAllInList",
    authorizeUser,
    itemGetAllInListValidator,
    async (req: ItemGetAllInListRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.items || !collections.shoppingLists) {
            console.warn("DB Collection items has not been initilized: ");
            const errorMap = req.errorMap ?? {};
            errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        try {
            const listId = req.body.listId;
            const userId = req.user?.id ?? "";

            const shoppingList = await collections.shoppingLists.findOne({
                _id: new ObjectId(listId),
                $or: [
                    { ownerId: userId }, // Check if the user is the owner of the list
                    { membersIdList: userId }
                ],
            });
            if (!shoppingList) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Shopping list with this id: ${listId} doesn't exist.` } });
                return;
            }

            const { amount, completed, order, pageInfo = { pageIndex: 0, pageSize: 10 } } = req.body;

            const queryFilter = [
                // Match documents based on the filtering conditions
                {
                    $match: {
                        $and: [
                            { listId: listId },
                            (typeof completed === "boolean") ? { completed: completed } : {},
                            (typeof amount === "number") ? { amount: { $gte: amount } } : {},
                        ],
                    },
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
            const items = await collections.items.aggregate(queryFilter).toArray();
            const totalCount = items[0]?.totalCount[0]?.count || 0; // Total count of matching documents
            const paginatedResults = items[0]?.paginatedResults || []; // Paginated results

            if (Array.isArray(paginatedResults)) {
                res.status(200).json({ items: paginatedResults, pageInfo: { ...pageInfo, total: totalCount } });
            } else {
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Failed to fetch the items" } });
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

export default organisationRouter;