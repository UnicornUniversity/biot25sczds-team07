import { ObjectId } from "mongodb";

export enum Policy {
    Admin = 0,
    Member = 1
}

export type OrganisationUser = {
    policy: Policy, id: string // ObjectId
}

export default class Organisation {
    constructor(
        public name: string,
        public description: string,
        public users: OrganisationUser[],
        public bucketToken: string,
        public createdEpoch: number,
        public updatedEpoch: number,
        public _id?: ObjectId
    ) { }
}