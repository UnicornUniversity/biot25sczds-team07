import { useState } from 'react'
import DefaultModal from '../../../components/modals/DefaultModal';
import { TemperatureData } from '../../../../API/requests/dataRequests';
import { Col, Form, FormSelect, Row } from 'react-bootstrap';
import dayjs from 'dayjs';

interface Props {
    modalVersion: "export-data";
    setModalVersion: (version: "export-data" | "") => void;
    name: string,
    sensorId: string
    data: TemperatureData[],
}
const ExportDataModal = (props: Props) => {
    const {
        setModalVersion,
        name, data
    } = props;

    const [exportType, setExportType] = useState<"csv" | "json">("csv");

    const exportDataHandler = async () => {
        const createBlob = () => {
            if (exportType === "json") {
                const exporData = data.map((tempData) => ({
                    ...tempData,
                    timeStamp: dayjs.unix(tempData.timeStamp).toISOString() // Convert to ISO string for better readability
                }))
                const stringJSON = JSON.stringify(exporData, null, 2);
                const blob = new Blob([stringJSON], { type: 'application/json;charset=utf-8;' });
                return { blob, fileName: `${name}_data.json` };
            }

            let csvContent = "Date-Time,temperature,state\n";
            data.forEach(d => {
                csvContent += `${dayjs.unix(d.timeStamp).toISOString()},${d.temperature},${d.state}\n`;
            });
            return {
                blob: new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
                fileName: `${name}_data.csv`
            };
        }

        const { fileName, blob } = createBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setModalVersion("");
    }

    return (
        <DefaultModal
            show
            title={`Export data`}
            onHide={() => setModalVersion("")}
            onSubmit={() => void exportDataHandler()}
            submitButtonColor='primary'
            submitText='Export Data'
        >
            <Row>
                <Col sm={12}>
                    <p>Exporting data for sensor: <b>{name}</b></p>
                </Col>
                <Col lg={4}>
                    <Form.Label htmlFor='export-type'>
                        Select Export type
                    </Form.Label>
                    <FormSelect
                        id='export-type'
                        //  value={exportType}
                        onChange={(e) => setExportType(e.target.value as "csv" | "json")}
                    >
                        <option defaultChecked value='csv'>CSV</option>
                        <option value='json'>JSON</option>
                    </FormSelect>
                </Col>
                <Col lg={8}>
                </Col>
            </Row>
        </DefaultModal>
    )
}

export default ExportDataModal