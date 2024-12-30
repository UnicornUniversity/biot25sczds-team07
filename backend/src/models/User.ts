import { ObjectId } from "mongodb";
import { Policy } from "./Organisation";

export default class User {
    constructor(
        public firstName: string,
        public lastName: string,
        public email: string,
        public password: string, // hash 
        public role: Policy,
        public createdEpoch: number,
        public updatedEpoch: number,
        public _id?: ObjectId
    ) { }
}