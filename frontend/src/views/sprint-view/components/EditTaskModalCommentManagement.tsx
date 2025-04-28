
import { useState, useEffect } from "react"; import { Button, Col, Form } from "react-bootstrap";
// import { v4 as uuidv4 } from 'uuid';
import MDEditor from '@uiw/react-md-editor';

import dayjs from "dayjs";

import { TaskType } from "../../../models/TaskModel";
import { CommentType, CommentCreateType } from "../../../models/CommentModel";
import { useLoggedUserContext } from "../../../customHooks/useLoggedUserContext";
import { useUser } from "../../../models/API/useUser";
import { User } from "../../../models/UserModel"

type Props = {
    taskComments: CommentType[];
    task: TaskType;
    submitNewComment: (comment: CommentCreateType) => Promise<void>
}
const EditTaskModalCommentManagement = (props: Props) => {
    const userApi = useUser();

    const { userData } = useLoggedUserContext();
    const [users, setUsers] = useState<User[]>();

    const { taskComments, task, submitNewComment } = props;

    const [newComment, setNewComment] = useState<CommentCreateType | null>(null);

    const commentInit = () => {
        if (!userData) {
            console.error("commentInit - userData is null: ", userData);
            return;
        }
        setNewComment({
            taskId: task._id,
            userId: userData._id,
            commentContent: "",
        });
    }

    useEffect(() => {
        userApi.getUsers().then((e) => { setUsers(e) });
    }, []);

    return (
        <div className="my-2 py-2">
            <Col md={12} className="mt-2">
                <h3>Comments</h3>
            </Col>

            <Col md={12} className="overflow-auto mb-3" style={{ maxHeight: 200 }}>
                {(taskComments.length < 1) && (
                    <p>There are no public commets for this task yet.</p>
                )}
                {taskComments.map((comment) => {
                    const commentUser = users?.find((user) => user._id === comment.userId);
                    return (
                        <div className="d-flex align-content-center gap-2 mb-2">
                            <div className="d-flex flex-column align-text-center" >
                                <span className="fw-bold">
                                    <i className="bi bi-person-circle me-1" />
                                    {commentUser?.username}{':'}
                                </span>
                                <span
                                    className="text-center"
                                    style={{ fontSize: '0.875rem', color: 'gray' }}
                                >
                                    {dayjs.unix(dayjs(comment.dateEpoch).unix()).format("DD.MM.YYYY hh:mm")}
                                </span>
                            </div>
                            <MDEditor.Markdown
                                source={comment.commentContent}
                                className="border border-1 px-3 rounded align-content-center flex-grow-1 "
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    color: 'black',
                                    backgroundColor: 'rgba(0,0,0,0)'
                                }}
                            />
                        </div>
                    )
                })}
            </Col>

            {newComment
                ? (
                    <>
                        <Col md={12}>
                            <Button variant="danger" onClick={() => setNewComment(null)} >
                                <i className="bi bi-x-circle" />
                                <span className="ms-2">Cancel Comment</span>
                            </Button>
                        </Col>


                        <Col md={12} className="my-2">
                            <Form className="d-flex">
                                <Form.Control
                                    type="textarea"
                                    placeholder="Comment's content..."
                                    onChange={(e) => setNewComment({ ...newComment, commentContent: e.target.value })}
                                    className="flex-grow-1"
                                />
                                <Button
                                    className="ms-2"
                                    variant="primary"
                                    onClick={() => {
                                        submitNewComment(newComment);
                                        setNewComment(null);
                                    }}
                                >
                                    <i className="bi bi-plus" />
                                </Button>
                            </Form>
                        </Col>
                    </>

                )
                : (
                    <Col md={12}>
                        <Button variant="primary" onClick={commentInit}>
                            <i className="bi bi-plus" />
                            <span className="ms-2">Add Comment</span>
                        </Button>
                    </Col>
                )
            }
        </div>
    );
}

export default EditTaskModalCommentManagement;