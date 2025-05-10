import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

import { SensorState, TemperatureData } from "../../../API/requests/dataRequests";

interface Props {
    data: TemperatureData[];
}

const sampleData: TemperatureData[] = [
    // Heating phase
    { timeStamp: 1746712482, temperature: 8, state: SensorState.HEATING },
    { timeStamp: 1746713082, temperature: 9, state: SensorState.HEATING },
    { timeStamp: 1746713682, temperature: 10, state: SensorState.HEATING },
    { timeStamp: 1746714282, temperature: 11, state: SensorState.HEATING },
    { timeStamp: 1746714882, temperature: 12, state: SensorState.HEATING },
    { timeStamp: 1746715482, temperature: 13, state: SensorState.HEATING },
    { timeStamp: 1746716082, temperature: 14, state: SensorState.HEATING },
    { timeStamp: 1746716682, temperature: 15, state: SensorState.HEATING },
    { timeStamp: 1746717282, temperature: 16, state: SensorState.HEATING },
    { timeStamp: 1746717882, temperature: 17, state: SensorState.HEATING },
    { timeStamp: 1746718482, temperature: 18, state: SensorState.HEATING },
    { timeStamp: 1746719082, temperature: 19, state: SensorState.HEATING },
    { timeStamp: 1746719682, temperature: 20, state: SensorState.HEATING },
    { timeStamp: 1746720282, temperature: 21, state: SensorState.HEATING },
    { timeStamp: 1746720882, temperature: 22, state: SensorState.HEATING },
    { timeStamp: 1746721482, temperature: 23, state: SensorState.HEATING },
    { timeStamp: 1746722082, temperature: 24, state: SensorState.HEATING },
    { timeStamp: 1746722682, temperature: 25, state: SensorState.HEATING },
    { timeStamp: 1746723282, temperature: 25, state: SensorState.HEATING },
    { timeStamp: 1746723882, temperature: 25, state: SensorState.HEATING },

    // Cooling phase
    { timeStamp: 1746724482, temperature: 24, state: SensorState.COOLING },
    { timeStamp: 1746725082, temperature: 23.5, state: SensorState.COOLING },
    { timeStamp: 1746725682, temperature: 23, state: SensorState.COOLING },
    { timeStamp: 1746726282, temperature: 22.5, state: SensorState.COOLING },
    { timeStamp: 1746726882, temperature: 22, state: SensorState.COOLING },
    { timeStamp: 1746727482, temperature: 21.8, state: SensorState.COOLING },
    { timeStamp: 1746728082, temperature: 21.6, state: SensorState.COOLING },
    { timeStamp: 1746728682, temperature: 21.4, state: SensorState.COOLING },
    { timeStamp: 1746729282, temperature: 21.2, state: SensorState.COOLING },
    { timeStamp: 1746729882, temperature: 21.1, state: SensorState.COOLING },
    { timeStamp: 1746730482, temperature: 21, state: SensorState.IDLE },
    { timeStamp: 1746731082, temperature: 21, state: SensorState.IDLE },
    { timeStamp: 1746731682, temperature: 21, state: SensorState.IDLE },
    { timeStamp: 1746732282, temperature: 21, state: SensorState.IDLE },
    { timeStamp: 1746732882, temperature: 21, state: SensorState.IDLE },
    { timeStamp: 1746733482, temperature: 21, state: SensorState.IDLE },
    { timeStamp: 1746734082, temperature: 21, state: SensorState.IDLE },
    { timeStamp: 1746734682, temperature: 21, state: SensorState.IDLE },
    { timeStamp: 1746735282, temperature: 21, state: SensorState.IDLE },
];

const TemperatureChart: React.FC<Props> = ({ data }) => {

    console.log("TemperatureChart data: ", data);
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


    interface DataPoint {
        date: string;
        timeStamp: number;
        temperature: number;
        state: SensorState;
    }
    // Format the data for Recharts
    const formattedData: DataPoint[] = sampleData.map((entry) => ({
        ...entry,
        date: new Date(entry.timeStamp * 1000).toLocaleString(), // Convert UNIX timestamp to readable date
    }));

    // Custom dot renderer to change the color based on state
    const renderCustomDot = (props: any) => {
        const { cx, cy, payload } = props;
        const color = stateColors[payload.state as SensorState]; // Get the color based on state
        return (
            <circle cx={cx} cy={cy} r={5} fill={color} stroke="none" />
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
                        <strong>Date:</strong> {dataPoint.date}
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
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" dy={15} /> {/* Add spacing between X-axis labels and axis */}
                <YAxis domain={[-10, 35]} label={{ value: "°C", position: "insideLeft" }} /> {/* Add °C label */}
                <Tooltip content={renderCustomTooltip} />
                <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#8884d8"
                    dot={renderCustomDot} // Use custom dot renderer
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default TemperatureChart;