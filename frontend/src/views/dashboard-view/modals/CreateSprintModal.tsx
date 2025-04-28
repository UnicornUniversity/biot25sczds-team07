import { SetStateAction, useState } from "react";
import DefaultModal from "../../../components/modals/DefaultModal";
import { Form, Row, Col, Alert } from "react-bootstrap";
import dayjs from "dayjs";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { SprintCreateType, SprintStateType } from "../../../models/SprintModel";

interface Props {
    modalVersion: '' | 'create-sprint', setModalVersion: React.Dispatch<SetStateAction<'' | 'create-sprint'>>,
    projectId: string,
    addNewSprint: (newSprint: SprintCreateType) => Promise<boolean>
}
const CreateSprintModal = (props: Props) => {
    const {
        modalVersion, setModalVersion,
        projectId, addNewSprint,
    } = props;

    const formId = 'create-sprint-form'

    const [validated, setValidated] = useState(false);
    const [newSprint, setNewSprint] = useState({
        projectId,
        name: "",
        state: 'PLANNED',
        dtFrom: dayjs(),
        dtEnd: dayjs().add(2, 'weeks')
    });
    const [alerts, setAlerts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmitNewSprint = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const invalidMessages: string[] = [];
        if (newSprint.name.length <= 5) {
            invalidMessages.push("Invalid name - must be at least 5 characters long.");
        }
        // Validate Dates
        if (newSprint.dtEnd.unix() <= newSprint.dtFrom.unix()) {
            invalidMessages.push("Invalid dates - END of the sprint must be after the START of the sprint.");
        }

        setValidated(true);
        setAlerts(invalidMessages);

        if (invalidMessages.length > 0) {
            return;
        }
        try {
            setIsLoading(true);
            const result = await addNewSprint({
                ...newSprint,
                dtFrom: newSprint.dtFrom.format("YYYY-MM-DD"),
                dtEnd: newSprint.dtEnd.format("YYYY-MM-DD"),
                state: newSprint.state as SprintStateType,
            });
            if (!result) {
                throw new Error("Failed to create sprint");
            }
            setModalVersion("");
        } catch (err) {
            console.error("handleSubmitNewSprint - error: ", err);
            setAlerts([...invalidMessages, "Failed to create new sprint (Unknown error)."]);
        }
        finally {
            setIsLoading(false);
        }
    };

    const nameValid = newSprint.name.length > 5;

    return (
        <DefaultModal
            show={modalVersion === "create-sprint"}
            onSubmit={() => { }}
            onHide={() => setModalVersion('')}
            submitFormId={formId}
            isLoading={isLoading}
            submitText="Add Sprint"
            title="Add Sprint"
        >
            <Form id={formId} noValidate onSubmit={handleSubmitNewSprint}>
                <Form.Group as={Row} controlId="inputProjectName">
                    <Form.Label column sm={4}>
                        Sprint's name:
                    </Form.Label>
                    <Col sm={8}>
                        <Form.Control
                            type="text"
                            placeholder="Enter sprint's name..."
                            isValid={validated && nameValid}
                            isInvalid={validated && !nameValid}
                            onChange={(e) => { setNewSprint({ ...newSprint, name: e.target.value }) }}
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} controlId="datePickerFrom" className="mt-2">
                    <Form.Label column sm={4}>
                        From:
                    </Form.Label>
                    <Col sm={8}>
                        <DatePicker
                            id="datePickerFrom"
                            showIcon
                            icon={<i className="bi bi-calendar" />}
                            dateFormat="dd.MM.YYYY"
                            selected={newSprint.dtFrom.toDate()}
                            maxDate={newSprint.dtEnd.toDate()}
                            onSelect={(e) => {
                                if (!e) { return; }
                                const dayjsDate = dayjs(e);
                                setNewSprint({ ...newSprint, dtFrom: dayjsDate });
                            }}
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} controlId="datePickerTo" className="mt-2">
                    <Form.Label column sm={4}>
                        To:
                    </Form.Label>
                    <Col sm={8}>
                        <DatePicker
                            id="datePickerTo"
                            showIcon
                            icon={<i className="bi bi-calendar" />}
                            dateFormat="dd.MM.YYYY"
                            selected={newSprint.dtEnd.toDate()}
                            minDate={newSprint.dtFrom.toDate()}
                            onSelect={(e) => {
                                if (!e) { return; }
                                const dayjsDate = dayjs(e);
                                setNewSprint({ ...newSprint, dtEnd: dayjsDate });
                            }} //when day is clicked
                        />
                    </Col>
                </Form.Group>
            </Form>

            {alerts.map((alert, i) => (
                <Alert key={`alert-${i}}`} variant="danger" className="mt-2" dismissible>{alert}</Alert>
            ))}
        </DefaultModal>
    );
}

export default CreateSprintModal;