import { InfluxDBClient, Point } from '@influxdata/influxdb3-client'
import { TemperatureData } from '../models/Data'

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


export { writeTemperatureData }