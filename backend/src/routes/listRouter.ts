import { NextFunction, Response, Router } from 'express';

import dayjs from "dayjs"
import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";

import { CreateListRequest, createListValidator } from '../validators/organisation/organisationAdd.validator';
import { DeleteListRequest, deleteListValidator } from '../validators/organisation/organisationDelete.validator';
import { GetListRequest, getListValidator } from '../validators/organisation/organisationGet.validator';
import { GetAllListRequest, getAllListValidator } from '../validators/organisation/organisationList.validator';
import { UpdateListRequest, updateListValidator } from '../validators/organisation/organisationUpdate.validator';

import { authorizeUser } from '../authorization/authorizeUser';
import ShoppingList from '../models/MeasurementPoint';

const listRouter = Router();

const getListUncheckedItemsCount = async (listId: ObjectId) => {
    if (!collections.items) { throw new Error("DB collection Items is in invalid state"); }
    const queryForUncheckedItems = [
        {
            $match: {
                $and: [
                    { listId: listId },
                    { completed: false }
                ],
            },
        },
        {
            $facet: {
                totalCount: [{ $count: "count" }], // Count total matching documents
            },
        },
    ];
    const listItems = await (collections.items).aggregate(queryForUncheckedItems).toArray();
    const totalCount = listItems[0]?.totalCount[0]?.count || 0; // Total count of matching documents
    return totalCount;
}


listRouter.post(
    "/create",
    authorizeUser,
    createListValidator,
    async (req: CreateListRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.shoppingLists) {
            console.warn("DB Collection shoppingLists has not been initilized: ");
            const errorMap = req.errorMap ?? {};
            errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        try {
            const newList = {
                name: req.body.name,
                ownerId: req.user?.id, // Assuming `req.user` contains the authenticated user's ID
                membersIdList: [], // Default empty array
                createdEpoch: dayjs().unix(), // Current timestamp in seconds
                updatedEpoch: dayjs().unix(), // Same as createdEpoch initially
            };
            const result = await collections.shoppingLists.insertOne(newList);
            if (result.acknowledged) {
                const createdList = await collections.shoppingLists.findOne({ _id: result.insertedId });
                if (createdList) {
                    res.status(201).json({ ...createdList, numberOfUncheckedItems: 0, errorMap: req.errorMap });
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
listRouter.post(
    "/delete",
    authorizeUser,
    deleteListValidator,
    async (req: DeleteListRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.shoppingLists || !collections.items) {
            console.warn("DB Collection shoppingLists has not been initilized: ");
            const errorMap = req.errorMap ?? {};
            errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }
        const id = req.body.id;
        const userId = req.user?.id ?? "";

        try {
            const query = {
                _id: new ObjectId(id), // Match by the inserted list ID
                $or: [
                    { ownerId: userId }, // Check if the user is the owner of the list
                    { membersIdList: userId }, // Check if the userId is in the membersIdList
                ],
            }
            const result = await collections.shoppingLists.deleteOne(query);

            if (result.acknowledged && result.deletedCount > 0) {
                const queryDeleteItems = {
                    listId: new ObjectId(id), // Match by the deleted list ID
                };
                await collections.items.deleteMany(queryDeleteItems); // Use the correct collection for items

                res.status(202).json({ errorMap: req.errorMap });
            } else if (result.deletedCount < 1) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Shopping list with this id: ${req.body.id} doesn't exists` } });
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
listRouter.get(
    "/get/:id",
    authorizeUser,
    getListValidator,
    async (req: GetListRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.shoppingLists) {
            console.warn("DB Collection shoppingLists has not been initilized: ");
            const errorMap = req.errorMap ?? {};
            errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const id = req?.params?.id;
        const userId = req.user?.id ?? "";

        try {
            const query = {
                _id: new ObjectId(id), // Match by the inserted list ID
                $or: [
                    { ownerId: userId }, // Check if the user is the owner of the list
                    { membersIdList: userId }, // Check if the userId is in the membersIdList
                ],
            }
            const shoppingList = await collections.shoppingLists.findOne(query);

            if (shoppingList) {
                const uncheckedItemsCount = await getListUncheckedItemsCount(new ObjectId(id));
                res.status(200).json({ ...shoppingList, numberOfUncheckedItems: uncheckedItemsCount, errorMap: req.errorMap });
            } else {
                res.status(404).json({ errorMap: { ...req.errorMap, ["500"]: `Unable to find matching shopping list with id: ${req.params.id}` } });
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
listRouter.post(
    "/getAll",
    authorizeUser,
    getAllListValidator,
    async (req: GetAllListRequest, res: Response) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.shoppingLists || !collections.items) {
            console.warn("DB Collection shoppingLists has not been initilized: ");
            const errorMap = req.errorMap ?? {};
            errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        try {
            const { numberOfUncheckedItems = 0, order = "decs", pageInfo = { pageIndex: 0, pageSize: 10 } } = req.body
            const userId = req.user?.id ?? "";

            const queryFilter = [
                // Match documents based on the filtering conditions
                {
                    $match: {
                        $and: [
                            {
                                $or: [
                                    { ownerId: userId }, // Match ownerId
                                    { membersIdList: userId }, // Check if userId is in membersIdList
                                ],
                            },
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


            const shoppingLists = await collections.shoppingLists.aggregate(queryFilter).toArray();
            const totalCount = shoppingLists[0]?.totalCount[0]?.count || 0; // Total count of matching documents
            const paginatedResults: (ShoppingList & { _id: ObjectId })[] = shoppingLists[0]?.paginatedResults || []; // Paginated results

            if (Array.isArray(paginatedResults)) {
                const listsWithUncheckedItems: (ShoppingList & { numberOfUncheckedItems: number })[] = [];
                for (const list of paginatedResults) {
                    if (!list._id) { continue; }
                    const uncheckedItemsCount = await getListUncheckedItemsCount(list._id);
                    // console.log(`unchecked items for listId: ${list._id} - ${uncheckedItemsCount}`)
                    if (uncheckedItemsCount < numberOfUncheckedItems) {
                        // console.log("not pushing the list to result");
                        continue;
                    }
                    listsWithUncheckedItems.push({ ...list, numberOfUncheckedItems: uncheckedItemsCount });
                }
                res.status(200).json({ lists: listsWithUncheckedItems, pageInfo: { ...pageInfo, total: totalCount } });
            } else {
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Failed to fetch the shopping lists" } });
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
listRouter.post(
    "/update",
    authorizeUser,
    updateListValidator,
    async (req: UpdateListRequest, res: Response) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.shoppingLists) {
            console.warn("DB Collection shoppingLists has not been initilized: ");
            const errorMap = req.errorMap ?? {};
            errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        try {
            const { id, name, membersIdList } = req.body;
            const userId = req.user?.id ?? ""
            const query = {
                _id: new ObjectId(id), // Match by the inserted list ID
                $and: [
                    { ownerId: userId }, // Check if the user is the owner of the list
                ],
            }

            // Define the update fields
            const updateFields: { updatedEpoch: number, name?: string, membersIdList?: string[] } = { updatedEpoch: dayjs().unix() };
            if (name) { updateFields.name = name; }
            if (membersIdList) { updateFields.membersIdList = membersIdList; }

            const result = await collections.shoppingLists.updateOne(query, { $set: updateFields });
            if (result.matchedCount === 0) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `There is no such shopping list with id: ${id}` } });
                return;
            }
            const updatedList = await collections.shoppingLists.findOne({ _id: new ObjectId(id) });
            if (updatedList) {
                const uncheckedItemsCount = await getListUncheckedItemsCount(new ObjectId(id));
                res.status(200).json({ ...updatedList, numberOfUncheckedItems: uncheckedItemsCount, errorMap: req.errorMap });
            } else {
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Failed to fetch the updated list" } });
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

export default listRouter;