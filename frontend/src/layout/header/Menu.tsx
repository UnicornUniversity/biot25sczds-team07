import { memo, useState } from 'react';
import { Navbar, Nav, Button, ButtonGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


import CreateProjectModal from './modals/CreateOrganisation';
import { useOrganisationContext } from '../../customHooks/useOrganisationsContext';
import { useLoggedUserContext } from '../../customHooks/useLoggedUserContext';

const Menu = () => {

    const navigate = useNavigate();
    const { userData, logoutUser } = useLoggedUserContext();
    const {
        organisations,
        selectedOrganisation, selectOrganisation,
    } = useOrganisationContext();

    const [modalVersion, setModalVersion] = useState<'create-organisation' | string>('');

    return (
        <>
            {modalVersion === 'create-organisation' && (
                <CreateProjectModal modalVersion={modalVersion} setModalVersion={setModalVersion} />
            )}

            <Navbar bg="dark" variant="dark" expand="lg" fixed="top" className='px-5'>
                <Navbar.Brand href="https://smart-terrarium.azurewebsites.net/" className='d-flex flex-row align-items-center'>
                    <img
                        src="./smart-terrarium-logo.png"
                        width={50}
                        height={50}
                        className="d-inline-block align-top me-2"
                        alt="Smart Terrarium logo"
                    />

                    Smart Terrarium
                </Navbar.Brand>
                <DropdownButton
                    as={ButtonGroup}
                    variant={'primary'}
                    title={selectedOrganisation?.name ?? "Create Organisation..."}
                    onSelect={(selectedKey) => {
                        if (!selectedKey) { return; }
                        if (selectedKey === "create") {
                            setModalVersion('create-organisation');
                            return;
                        }
                        selectOrganisation(organisations?.find((org) => org._id === selectedKey) ?? null);
                        navigate('/');
                    }}
                >
                    {organisations?.map((organisation) => (
                        <Dropdown.Item
                            key={organisation._id}
                            eventKey={organisation._id}
                            active={selectedOrganisation?._id === organisation._id}
                        >
                            {organisation.name}
                        </Dropdown.Item>
                    ))}
                    <Dropdown.Divider />
                    <Dropdown.Item eventKey="create">+ Add New</Dropdown.Item>
                </DropdownButton>
                {/* <Navbar.Brand as={Link} to="/dashboard" className="ms-3">
                SprintPlanner
            </Navbar.Brand> */}
                <Nav className="ms-auto d-flex flex-row  align-items-center">
                    <Button
                        variant="primary"
                        className="rounded fw-bold d-flex justify-content-center"
                        onClick={() => navigate(`/user/${userData?._id ?? ""}`)}
                    >
                        <span className='m-0 p-0'>
                            {userData?.email ?? "UNDEFINED"}
                        </span>
                    </Button>
                    <div className='ms-4'>
                        <Button
                            variant="danger"
                            className="text-light"
                            onClick={logoutUser}
                        >
                            <i className="bi bi-box-arrow-right fs-4"></i>
                        </Button>
                    </div>
                </Nav>
            </Navbar>
        </>
    );
};

export default memo(Menu);
