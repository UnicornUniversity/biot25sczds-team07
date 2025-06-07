import { InfluxDBClient, Point } from '@influxdata/influxdb3-client'
import { SensorDataInfluxOutput, TemperatureData } from '../models/Data'

const token = process.env.INFLUXDB_TOKEN
const db_bucket = process.env.INFLUXDB_BUCKET

if (!token || !db_bucket) {
    throw new Error('InfluxDB token or bucket is not defined in environment variables.')
}

// Create a single instance of the InfluxDB client
const influxClient = new InfluxDBClient({
    host: 'https://eu-central-1-1.aws.cloud2.influxdata.com',
    token: token,
    database: db_bucket,
})

const writeTemperatureData = async (
    data: TemperatureData[],
    measurementPointId: string,
    sensorId: string
) => {
    try {
        const points = data.map((entry) => {
            const point = Point.measurement('temperature')
                .setTag('measurementPointId', measurementPointId)
                .setTag('sensorId', sensorId)
                .setIntegerField('temperature', entry.temperature)
                .setIntegerField('state', entry.state) // Convert state to string if necessary
                .setTimestamp(new Date(entry.timeStamp * 1000)) // Convert UNIX timestamp to milliseconds
            return point
        })

        console.log("writing points to influxDB: ", points);
        await influxClient.write(points)
        console.log('Data successfully written to InfluxDB.')
    } catch (error) {
        console.error('Error writing data to InfluxDB:', error)
        throw error;
    }
}

const readTemperatureData = async (
    from: number, // UNIX seconds
    to: number,   // UNIX seconds
    measurementPointId: string,
    sensorId: string // now required
): Promise<SensorDataInfluxOutput> => {
    try {
        // Convert UNIX seconds to RFC3339 timestamps for SQL query
        const fromDate = new Date(from * 1000).toISOString();
        const toDate = new Date(to * 1000).toISOString();

        const sql = `
           SELECT "sensorId", "state", "temperature", "time"
           FROM "temperature"
           WHERE
                time >= TIMESTAMP '${fromDate}'
                AND time <= TIMESTAMP '${toDate}'
                AND "measurementPointId" = '${measurementPointId}'
                AND "sensorId" = '${sensorId}'
                AND ("state" IS NOT NULL OR "temperature" IS NOT NULL)
           UNION ALL
                SELECT "sensorId", NULL AS "state", AVG("temperature") AS "temperature", NULL AS "time"
                FROM "temperature"
                WHERE
                    time >= TIMESTAMP '${fromDate}'
                    AND time <= TIMESTAMP '${toDate}'
                    AND "measurementPointId" = '${measurementPointId}'
                    AND "sensorId" = '${sensorId}'
                    AND "temperature" IS NOT NULL
            GROUP BY "sensorId"
       `;

        console.log("Executing Flux query: ", sql);

        const sensorData: TemperatureData[] = []
        let averageTemperature: number | null = null

        const rows = influxClient.query(sql, db_bucket);
        console.log("rows: ", rows);

        for await (const row of rows) {
            console.log("Rows returned from InfluxDB: ", row);

            // // If the row has _time, it's a data row; otherwise, it's the average row
            if (row.temperature !== undefined && row.time && row.sensorId) {
                console.log("pussing to data...");
                sensorData.push({
                    temperature: Number(row.temperature),
                    state: Number(row.state),
                    timeStamp: Math.floor(new Date(row.time).getTime() / 1000),
                })
            } else if (row.temperature !== undefined && !row.time) {
                averageTemperature = Number(row.temperature)
            }
        }
        return { sensorData, sensorId, averageTemperature }
    } catch (error) {
        console.error('Error reading data from InfluxDB:', error);
        throw error;
    }
}




export { writeTemperatureData, readTemperatureData }