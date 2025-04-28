import { ObjectId } from "mongodb";
import { BaseEntity } from "./BaseEntity";

export enum Policy {
    Admin = 0,
    Member = 1
}

export interface OrganisationUser {
    policy: Policy,
    id: ObjectId // ObjectId
}

export default interface Organisation extends BaseEntity {
    name: string,
    description: string,
    users: OrganisationUser[],
    bucketToken: string,
}