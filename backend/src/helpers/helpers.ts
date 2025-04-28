import { ObjectId } from "mongodb"
import { Policy } from "../models/Organisation"
import { collections } from "../services/database.service"

export const validateUserHasAdminAccessToOrg = async (userId: string, organisationId: ObjectId) => {
    if (!collections.organisations) {
        return { code: 500, message: "DB is in invalid state - collection Organisations doesn't exist" }
    }
    const queryOrganisation = {
        _id: organisationId,
        deleted: { $exists: false },
        users: {
            $elemMatch: {
                id: userId,
                policy: Policy.Admin
            }
        }
    }
    const organisation = await collections.organisations.findOne(queryOrganisation);
    // console.log("validateUserHasAdminAccessToOrg - found desired organisation: ", organisation);
    if (organisation) {
        return organisation;
    }
    return {
        code: 404,
        message: `Organisation with id: ${organisationId} and this user (must have Admin Policy): ${userId} doesn't exists`
    }
}

export const isUserAdmin = async (userId: string) => {
    if (!collections.users) {
        return false;
    }
    const isUserAdmin = await collections.users.findOne({
        _id: new ObjectId(userId),
        role: Policy.Admin,
        deleted: { $exists: false },
    });
    return !!isUserAdmin;
}