import { NextFunction, Response, Router } from 'express';
import dayjs from 'dayjs';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

import { collections } from '../services/database.service';

import User from '../models/User';
import { Policy } from '../models/Organisation';

import { AuthorizationRequest, authorizeJWTToken, generateToken, verifyToken } from '../authorization/authorizeUser';
import { isUserAdmin } from '../helpers/helpers';

import { UserAddRequest, userAddValidator } from '../validators/user/userAdd.validator';
import { UserDeleteRequest, userDeleteValidator } from '../validators/user/userDelete.validator';
import { UserUpdateRequest, userUpdateValidator } from '../validators/user/userUpdate.validator';
import { UserListRequest, userListValidator } from '../validators/user/userList.validator';
import { UserAuthorizeRequest, userAuthorizeValidator } from '../validators/user/userAuthorize.validator';

const userRouter = Router();


userRouter.post(
    "/register",
    // authorizeJWTToken,
    userAddValidator,
    async (req: UserAddRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.users) {
            console.warn("DB Collection Users has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        try {
            const { firstName, lastName, email, password, role } = req.body;

            let isAdmin = false;
            if (token) {
                const userId = verifyToken(token);
                if (typeof userId === "string") {
                    const user = await collections.users.findOne({ _id: userId, role: Policy.Admin });
                    if (user) {
                        isAdmin = true;
                    }
                }
            }

            const saltRounds = 10; // You can adjust the number of salt rounds as needed
            const hashPassword = async (password: string): Promise<string> => {
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                return hashedPassword;
            };

            // const userId = req.userId ?? "";

            const epochNow = dayjs().unix();
            const newUser: User = {
                firstName,
                lastName,
                email,
                password: await hashPassword(password),
                role: isAdmin ? role : Policy.Member,
                createdEpoch: epochNow,
                updatedEpoch: epochNow,
            }

            const result = await collections.users.insertOne(newUser);
            if (!result.insertedId) {
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Insert operation failed" } });
                return;
            }

            const createdUser = await collections.users.findOne(
                { _id: result.insertedId },
                { projection: { password: 0 }, }
            );
            if (createdUser) {
                res.status(201).json({ ...createdUser, errorMap: req.errorMap });
            } else {
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Failed to fetch the created User Document" } });
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


userRouter.post(
    "/authorize",
    userAuthorizeValidator,
    async (req: UserAuthorizeRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.users) {
            console.warn("DB Collection Users has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        try {
            const { email, password, token } = req.body;

            if (token) {
                const result = await verifyToken(token);
                if (result === 500) {
                    req.errorMap["500"] = "Internal Server Error";
                    res.status(500).json({ errorMap: req.errorMap });
                    return;
                }
                if (result === 403) {
                    req.errorMap["403"] = "Unauthorized";
                    res.status(403).json({ errorMap: req.errorMap });
                    return;
                }
                const user = await collections.users.findOne(
                    { _id: new ObjectId(result) },
                    { projection: { password: 0 } }
                );
                if (user) {
                    res.status(200).json({ token, ...user, errorMap: req.errorMap });
                    return;
                }
                res.status(403).json({ errorMap: { ...req.errorMap, ["403"]: `Unauthorized` } });
            }
            else if (email && password) {
                const dbUser = await collections.users.findOne(
                    {
                        email: email,
                    },
                );
                if (!dbUser) {
                    req.errorMap["403"] = "Unauthorized";
                    res.status(403).json({ errorMap: req.errorMap });
                    return;
                }
                const verifiedPassword = await bcrypt.compare(password, dbUser.password as string);
                if (!verifiedPassword) {
                    req.errorMap["403"] = "Unauthorized";
                    res.status(403).json({ errorMap: req.errorMap });
                    return;
                }
                const generatedToken = generateToken({ id: dbUser._id.toString() });
                delete dbUser.password;
                res.status(200).json({ ...dbUser, token: generatedToken, errorMap: req.errorMap });
                return;
            }

            res.sendStatus(401); // Unauthorized if no token is present
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

userRouter.post(
    "/delete",
    authorizeJWTToken,
    userDeleteValidator,
    async (req: UserDeleteRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.users || !collections.organisations) {
            console.warn("DB Collection Organisations or Users has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        try {
            const toDeleteUserId = req.body.id;
            const userId: string = req.userId ?? ""; // signed user

            if (userId !== toDeleteUserId) {
                const isAdmin = await isUserAdmin(userId);
                if (!isAdmin) {
                    req.errorMap["403"] = "Signed user is not admin and is trying to delete different user than him self.";
                    res.status(403).json(req.errorMap);
                    return;
                }
            }

            const deletedResult = await collections.users.deleteOne({
                _id: new ObjectId(toDeleteUserId),
            });
            if (deletedResult.deletedCount < 1) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `User with this id: ${toDeleteUserId} doesn't exist.` } });
                return;
            } else if (deletedResult.acknowledged) {
                const filter = {
                    "users.id": toDeleteUserId
                };
                const update = {
                    $pull: {
                        users: { id: toDeleteUserId }
                    }
                };
                await collections.organisations.updateMany(filter, update)

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
userRouter.post(
    "/update",
    authorizeJWTToken,
    userUpdateValidator,
    async (req: UserUpdateRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.users) {
            console.warn("DB Collection Users has not been initilized: ");
            req.errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const { id, firstName = "", lastName = "", email = "", password = "", role } = req.body;
        const userId = req.userId ?? "";
        try {

            const isAdmin = await isUserAdmin(userId);
            if (userId !== id) {
                if (!isAdmin) {
                    req.errorMap["403"] = "Signed user is not admin and is trying to update different user than him self.";
                    res.status(403).json(req.errorMap);
                    return;
                }
            }

            // Define the update fields
            const updateFields: {
                firstName?: string,
                lastName?: string,
                email?: string,
                password?: string, // hash 
                role?: Policy,
                updatedEpoch: number,
            } = { updatedEpoch: dayjs().unix() };
            if (firstName) { updateFields.firstName = firstName; }
            if (lastName) { updateFields.lastName = lastName; }
            if (email) { updateFields.email = email; }
            if (password) { updateFields.password = password; }
            if (isAdmin && typeof role === "number") {
                updateFields.role = role;
            }

            const result = await collections.users.updateOne(
                {
                    _id: new ObjectId(id),
                },
                { $set: updateFields }
            );
            if (result.matchedCount < 1) {
                res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `There is no such User with id: ${id}` } });
                return;
            }
            const updatedUser = await collections.users.findOne(
                { _id: new ObjectId(id) },
                { projection: { password: 0 } }
            );
            if (updatedUser) {
                res.status(200).json({ ...updatedUser, errorMap: req.errorMap });
            } else {
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Failed to fetch the updated User" } });
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

userRouter.get(
    "/get:id",
    authorizeJWTToken,
    async (req: AuthorizationRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.users) {
            console.warn("DB Collection Users has not been initilized: ");
            const errorMap = req.errorMap ?? {};
            errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        const getUserId = req?.params?.id;

        try {
            const user = await collections.users.findOne(
                { _id: new ObjectId(getUserId) },
                { projection: { password: 0 } }
            );
            if (user) {
                res.status(200).json({ ...user, errorMap: req.errorMap });
                return;
            }
            res.status(404).json({ errorMap: { ...req.errorMap, ["404"]: `Unable to find matching Organisation with id: ${getUserId}` } });
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

userRouter.post(
    "/list",
    authorizeJWTToken,
    userListValidator,
    async (req: UserListRequest, res: Response, next: NextFunction) => {
        req.errorMap = req.errorMap ?? {};
        if (!collections.users) {
            console.warn("DB Collection Organisations has not been initilized: ");
            const errorMap = req.errorMap ?? {};
            errorMap["500"] = "DB is not in correct state";
            res.status(500).json(req.errorMap);
            return;
        }

        try {
            const { findEmailString, pageInfo = { pageIndex: 0, pageSize: 20 }, order = "asc" } = req.body;
            // const userId = req.userId ?? "";

            const queryFilter = [
                {
                    $match: {
                        email: { $regex: findEmailString, $options: 'i' } // Case-insensitive search
                    }
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
            const users = await collections.users.aggregate(queryFilter).toArray();
            const totalCount = users[0]?.totalCount[0]?.count || 0; // Total count of matching documents
            const paginatedResults = users[0]?.paginatedResults || []; // Paginated results

            if (Array.isArray(paginatedResults)) {
                res.status(200).json({ users: paginatedResults, pageInfo: { ...pageInfo, total: totalCount } });
            } else {
                res.status(500).json({ errorMap: { ...req.errorMap, ["500"]: "Failed to fetch the Users" } });
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

export default userRouter;