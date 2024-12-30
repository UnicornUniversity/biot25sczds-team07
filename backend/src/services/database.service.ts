
import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

// External Dependencies

// Global Variables

// Initialize Connection

export async function connectToDatabase() {
    dotenv.config();

    const { DB_CONN_STRING, DB_NAME, ORGANISATION_COLLECTION_NAME, MEASUREMENT_POINT_COLLECTION_NAME, USERS_COLLECTION_NAME } = process.env;

    if (!DB_CONN_STRING) { throw Error("Invalid .env - DB_CONN_STRING is missing or has invalid value"); }
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(DB_CONN_STRING);

    await client.connect();

    if (!DB_NAME) { throw Error("Invalid .env - DB_NAME is missing or has invalid value"); }
    const db: mongoDB.Db = client.db(process.env.DB_NAME);

    if (!ORGANISATION_COLLECTION_NAME) { throw Error("Invalid .env - ORGANISATION_COLLECTION_NAME is missing or has invalid value"); }
    const organisationsCollection: mongoDB.Collection = db.collection(ORGANISATION_COLLECTION_NAME);

    if (!MEASUREMENT_POINT_COLLECTION_NAME) { throw Error("Invalid .env - MEASUREMENT_POINT_COLLECTION_NAME is missing or has invalid value"); }
    const measurementPointsCollection: mongoDB.Collection = db.collection(MEASUREMENT_POINT_COLLECTION_NAME);

    if (!USERS_COLLECTION_NAME) { throw Error("Invalid .env - USERS_COLLECTION_NAME is missing or has invalid value"); }
    const usersCollection: mongoDB.Collection = db.collection(USERS_COLLECTION_NAME);

    collections.organisations = organisationsCollection;
    collections.measurementPoints = measurementPointsCollection;
    collections.users = usersCollection;

    console.log(`Successfully connected to database: ${db.databaseName} and collections: (measurementConfigs: ${organisationsCollection.collectionName}, measurementPoints: ${measurementPointsCollection.collectionName}, users: ${usersCollection.collectionName}`);
}

export const collections: {
    organisations?: mongoDB.Collection,
    measurementPoints?: mongoDB.Collection,
    users?: mongoDB.Collection
} = {}
