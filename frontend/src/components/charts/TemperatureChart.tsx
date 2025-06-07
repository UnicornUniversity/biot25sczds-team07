import { memo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

import { SensorDataInfluxOutput, SensorState } from "../../../API/requests/dataRequests";
import { Table } from "react-bootstrap";
import dayjs from "dayjs";

interface Props {
    data: SensorDataInfluxOutput;
    showStats?: boolean; // Optional prop to control stats display
    customDateFormat?: string,
}
const TemperatureChart = (props: Props) => {
    const { data, showStats, customDateFormat = "DD.MM.YY HH:mm" } = props;

    if (data.sensorData.length < 1) {
        return (
            <div className="text-center">
                <p>No data available for the sensor.</p>
            </div>
        );
    }

    // Map state to colors
    const stateColors: Record<SensorState, string> = {
        [SensorState.IDLE]: "#001219", // Purple
        [SensorState.HEATING]: "#bb3e03", // Green
        [SensorState.COOLING]: "#0a9396", // Orange
    };
    const stateLabels: Record<SensorState, string> = {
        [SensorState.IDLE]: "IDLE",
        [SensorState.HEATING]: "HEATING",
        [SensorState.COOLING]: "COOLING",
    };

    const statistics = {
        min: data.sensorData[0],
        max: data.sensorData[0],
        average: data.averageTemperature?.toFixed(1) ?? "---",
    }

    interface DataPoint {
        timeStamp: number;
        temperature: number;
        state: SensorState;
    }
    // Format the data for Recharts
    const formattedData: DataPoint[] = data.sensorData.map((entry) => {
        if (showStats) {
            if (entry.temperature < statistics.min.temperature) {
                statistics.min = entry;
            }
            else if (entry.temperature > statistics.max.temperature) {
                statistics.max = entry;
            }
        }

        return entry;
    });

    // console.log("formattedData: ", formattedData);

    // Custom dot renderer to change the color based on state
    const renderCustomDot = (props: any) => {
        const { cx, cy, payload } = props;
        const color = stateColors[payload.state as SensorState]; // Get the color based on state
        return (
            <circle cx={cx} cy={cy} r={4} fill={color} stroke="none" />
        );
    };

    // Custom tooltip renderer
    const renderCustomTooltip = (props: any) => {
        const { active, payload } = props;
        if (active && payload && payload.length) {
            const dataPoint: DataPoint = payload[0].payload;
            const color = stateColors[dataPoint.state];
            return (
                <div
                    style={{
                        backgroundColor: "#fff",
                        border: `1px solid ${color}`,
                        borderRadius: "5px",
                        padding: "10px",
                        color: color,
                    }}
                >
                    <p style={{ margin: 0 }}>
                        <strong>Date:</strong> {dayjs.unix(dataPoint.timeStamp).format("DD.MM.YYYY HH:mm")}
                    </p>
                    <p style={{ margin: 0 }}>
                        <strong>Temperature:</strong> {dataPoint.temperature}°C
                    </p>
                    <p style={{ margin: 0 }}>
                        <strong>State:</strong> {stateLabels[dataPoint.state]}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="timeStamp"
                        dy={15}
                        scale="time"
                        // type="number"
                        tickFormatter={(val: number) => dayjs.unix(val).format(customDateFormat)}
                    />
                    <YAxis domain={[-10, 50]} label={{ value: "°C", position: "insideLeft" }} /> {/* Add °C label */}
                    <Tooltip content={renderCustomTooltip} />
                    <Line
                        key={data.sensorId}
                        type="monotone"
                        dataKey="temperature"
                        stroke="#8884d8"
                        dot={renderCustomDot} // Use custom dot renderer
                    />
                </LineChart>
            </ResponsiveContainer>
            {showStats && (
                <Table striped bordered hover size="sm" className="mt-3">
                    <thead>
                        <tr>
                            <th className="text-info">
                                Lowest Temperature
                                <i className="bi bi-arrow-down ms-1" />
                            </th>
                            <th className="text-danger">
                                Highest Temperature
                                <i className="bi bi-arrow-up ms-1" />
                            </th>
                            <th>
                                Average Temperature
                                <i className="bi bi-dash ms-1" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><b>{statistics.min.temperature}</b></td>
                            <td><b>{statistics.max.temperature}</b></td>
                            <td><b>{statistics.average}</b></td>
                        </tr>
                        <tr>
                            <td>{dayjs.unix(statistics.min.timeStamp).format("DD.MM.YYYY hh:ss")}</td>
                            <td>{dayjs.unix(statistics.max.timeStamp).format("DD.MM.YYYY hh:ss")}</td>
                            <td>---</td>
                        </tr>
                    </tbody>
                </Table>
            )}
        </>
    );
};

export default memo(TemperatureChart);