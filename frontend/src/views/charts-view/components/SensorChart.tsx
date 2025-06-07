import React, { useState } from 'react'
import { Sensor } from '../../../../API/requests/measurementPointsRequests'
import { SensorDataInfluxOutput } from '../../../../API/requests/dataRequests'
import { Alert, Button } from 'react-bootstrap';
import TemperatureChart from '../../../components/charts/TemperatureChart';
import ExportDataModal from '../modals/ExportDataModal';
import dayjs from 'dayjs';

interface Props {
    fromDayJs: dayjs.Dayjs,
    toDayJs: dayjs.Dayjs
    sensor: Sensor,
    sensorData: SensorDataInfluxOutput,
}
const SensorChart = (props: Props) => {
    const {
        fromDayJs, toDayJs,
        sensor, sensorData
    } = props;

    const [modalVersion, setModalVersion] = useState<"export-data" | "">("");

    if (!sensorData || sensorData.sensorData.length < 1) {
        return (
            <div className='border border-1 p-3 rounded'>
                <p className="text-info">
                    <strong className="">Sensor {sensor.name}</strong>
                </p>
                <Alert variant="warning" className="mb-3">
                    <span key={sensor.sensorId}>No data available for sensor (measured quantity: {sensor.quantity}) in the selected interval ({fromDayJs.format("DD.MM.YYYY")} - {toDayJs.format("DD.MM.YYYY")}).</span>
                </Alert>

            </div>
        );
    }

    return (
        <>
            {modalVersion === "export-data" && (
                <ExportDataModal
                    modalVersion={modalVersion}
                    setModalVersion={setModalVersion}
                    name={sensor.name}
                    sensorId={sensor.sensorId}
                    data={sensorData.sensorData}
                />
            )}


            <div className='border border-1 p-3 rounded my-2' key={sensorData.sensorId}>
                <Button
                    className='mb-2 me-auto'
                    style={{ alignSelf: "flex-start" }}
                    variant='primary'
                    onClick={() => setModalVersion("export-data")}
                >
                    Expor Data
                </Button>

                <p className="text-info">
                    <strong className="">Sensor {sensor.name}</strong>
                </p>
                <TemperatureChart showStats key={sensor.sensorId} data={sensorData} />
            </div>
        </>
    );
}

export default SensorChart