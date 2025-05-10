import { ReactNode } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";

interface Props {
    show: boolean,
    onHide: () => void,
    onSubmit: () => void | Promise<void>,
    title?: string,
    submitText?: string,
    submitButtonColor?: "primary" | "secondary" | "info" | "warning" | "danger" | "success",
    children?: ReactNode[] | ReactNode,
    submitFormId?: string,
    isLoading?: boolean,
    size?: "sm" | "lg" | "xl"
}
const DefaultModal = (props: Props) => {
    const {
        show, onHide, onSubmit,
        title = "", children = null, submitFormId = "", isLoading = false, submitText = "", submitButtonColor = "primary", size
    } = props;

    // const [isLoading, setIsLoading] = useState(false);

    return (
        <Modal show={show} onHide={onHide} size={size}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{children}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
                <Button
                    variant={submitButtonColor}
                    form={submitFormId}
                    type={submitFormId ? "submit" : "button"}
                    onClick={onSubmit}
                    hidden={!isLoading && !submitText}
                >
                    {submitText}
                    {isLoading
                        ? (
                            <>
                                <Spinner className="ms-1" as="span" size="sm" aria-hidden="true" animation="border" role="status" />
                                <span className="visually-hidden">Loading...</span>
                            </>
                        )
                        : null
                    }
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DefaultModal;