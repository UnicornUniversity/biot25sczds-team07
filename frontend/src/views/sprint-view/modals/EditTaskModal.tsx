import React, { SetStateAction, useState, useEffect } from "react";
import { Row, Col, Button, Form } from "react-bootstrap";
import MDEditor from '@uiw/react-md-editor';

import DefaultModal from "../../../components/modals/DefaultModal";

import EditTaskModalCommentManagement from "../components/EditTaskModalCommentManagement";
import { TaskType } from "../../../models/TaskModel";
import { SprintType } from "../../../models/SprintModel";
import { CommentCreateType, CommentType } from "../../../models/CommentModel";
import { useComment } from "../../../models/API/useComments";
import { User } from "../../../models/UserModel";
import { useUser } from "../../../models/API/useUser";
// import { useTask } from "../../../models/API/useTask";

interface Props {
    modalVersion: '' | 'edit-task', setModalVersion: React.Dispatch<SetStateAction<'' | 'edit-task' | 'create-task'>>,
    projectId: string,
    sprint: SprintType,
    editedTask: TaskType,
    submitTaskEdit: (task: TaskType) => Promise<boolean>,
    submitTaskDelete: (taskId: string) => Promise<boolean>
}

const EditTaskModal = (props: Props) => {
    const userApi = useUser();
    // const taskApi = useTask();
    const CommentApi = useComment();
    const {
        modalVersion, setModalVersion,
        submitTaskEdit, submitTaskDelete,
        editedTask,
    } = props;

    // const [validated, setValidated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [alerts, setAlerts] = useState<string[]>([]);
    const [editedTaskNewVersion, setEditedTaskNewVersion] = useState(editedTask);
    const [users, setUsers] = useState<User[]>();

    const [taskComments, setTaskComments] = useState<CommentType[]>([]);
    const [deleteTaskModal, setDeleteTaskModal] = useState(false);


    const handleSubmitTaskChange = async () => {
        const result = await submitTaskEdit(editedTaskNewVersion);
        if (result) {
            // setValidated(true);
            setModalVersion('');
            return;
        }
        alert("SOMETHING WENT WRONG");
    }

    const handleSubmitNewComment = async (comment: CommentCreateType) => {
        try {
            setIsLoading(true);
            const result: CommentType = await CommentApi.createComment(comment);
            console.log("handleSubmitNewComment - result: ", result);
            if (!result._id) { throw new Error("failed to add comment"); }
            setTaskComments([...taskComments, result]);
        } catch (err) {
            console.error("handleSubmitNewComment - failed adding the comment: ", err);
            setAlerts([...alerts, "Failed to add Comment"]);
        }
        finally { setIsLoading(false); }
    }

    const handleSubmitTaskDelete = async () => {
        try {
            const deleted = await submitTaskDelete(editedTaskNewVersion._id);
            if (!deleted) {
                console.error("handleSubmitTaskDelete - failed to delete task");
                return;
            }
            setDeleteTaskModal(false);
            setModalVersion('');
        } catch (err) {
            console.error("handleSubmitTaskDelete - error: ", err);
        }
    }

    useEffect(() => {
        const fetchTaskComments = async () => {
            if (!editedTask) { return; }
            const comments: CommentType[] = await CommentApi.getCommentsForTask(editedTask._id);
            console.log("fetchTaskComments - comments: ", comments);
            setTaskComments(comments)
        }
        fetchTaskComments();
    }, [editedTask]);

    useEffect(() => {
        async function fetchUsers() {
            const users = await userApi.getUsers();
            setUsers(users);
        }
        fetchUsers();
    }, []);

    if (deleteTaskModal) {
        return (
            <DefaultModal
                show={deleteTaskModal}
                onSubmit={handleSubmitTaskDelete}
                isLoading={isLoading}
                onHide={() => setDeleteTaskModal(false)}
                submitText="Delete" submitButtonColor="danger"
                title={`Delete TaskType`}
            >
                <p>Do you want to delete this task (<span className="fw-bold">{editedTaskNewVersion.name}</span>)?</p>
            </DefaultModal>
        )
    }

    return (
        <DefaultModal
            show={modalVersion === "edit-task"}
            onSubmit={() => handleSubmitTaskChange()}
            isLoading={isLoading}
            onHide={() => setModalVersion('')}
            submitText="Save"
            // title={editedTaskNewVersion.name}
            size="lg"
        // submitFormId={formId}
        >
            <Row className="mb-3">

                <Col md={8}>
                    <h3>{editedTaskNewVersion.name}</h3>
                </Col>

                <Col md={4} className="d-flex justify-content-between flex-column gap-2 align-items-end">
                    <Row className="flex-row w-100">
                        <Col>
                            <span>Assignee:{' '}</span>
                        </Col>
                        <Col className="text-end">
                            <span className="fw-bold">
                                {users?.find((user) => user._id === editedTaskNewVersion.asignedUserId)?.username ?? ""}
                            </span>
                        </Col>
                    </Row>
                    <Form.Group as={Row} className="w-100">
                        <Form.Label htmlFor="priority-select" className="col-auto m-0 d-flex align-items-center">
                            Priority: {' '}
                        </Form.Label>
                        <div className="col d-flex justify-content-end">
                            <Form.Select
                                id="priority-select"
                                className="w-auto align-self-end"
                                onChange={(e) => setEditedTaskNewVersion({
                                    ...editedTaskNewVersion,
                                    priority: (e.target.value as "VH" | "N" | "L" | "VL")
                                })}
                            >
                                {[
                                    { priorityKey: "VH", text: "Very High" },
                                    { priorityKey: "N", text: "Neutral" },
                                    { priorityKey: "L", text: "Low" },
                                    { priorityKey: "VL", text: "Very Low" },
                                ].map((option, index) => (
                                    <option
                                        key={index}
                                        selected={editedTaskNewVersion.priority === option.priorityKey}
                                        value={option.priorityKey}
                                    >
                                        {option.text}
                                    </option>
                                ))}
                            </Form.Select>
                        </div>
                    </Form.Group>
                    <Button variant="danger" onClick={() => { setDeleteTaskModal(true) }}>
                        <i className="bi bi-trash" />
                        <span className="ms-2">Delete</span>
                    </Button>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    <MDEditor
                        value={editedTaskNewVersion.description}
                        onChange={(newVal) => {
                            setEditedTaskNewVersion(prevState => {
                                return { ...prevState, description: newVal ?? "" }
                            })
                        }}
                        textareaProps={{
                            placeholder: "Write task description..."
                        }}
                        preview='edit'
                    />
                </Col>

                <EditTaskModalCommentManagement
                    taskComments={taskComments}
                    task={editedTask}
                    submitNewComment={handleSubmitNewComment}
                />
            </Row>
        </DefaultModal >
    );
}

export default EditTaskModal;