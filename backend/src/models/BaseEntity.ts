import { ObjectId, Document } from "mongodb";

export interface BaseEntity extends Document {  
         created: number,
         updated?: number,
         deleted?: number,
         _id?: ObjectId,   
}
