import { useEffect, useState } from 'react';
import { Navbar, Nav, Button, ButtonGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


import organisationRequests, { Organisation } from '../../../API/requests/organisationRequests'
import CreateProjectModal from './modals/CreateProjectModal';
import { useMainContext } from '../../customHooks/useMainContext';
import { useLoggedUserContext } from '../../customHooks/useLoggedUserContext';

const Menu = () => {

    const navigate = useNavigate();
    const { userData } = useLoggedUserContext();
    const { selectedOrganisation, setSelectedOrganisation } = useMainContext();

    const [isLoading, setIsLoading] = useState(false);
    const [organisations, setOrganisations] = useState<Organisation[]>([]);
    const [modalVersion, setModalVersion] = useState<'create-organisation' | string>('');

    useEffect(() => {
        const fetchOrganisations = async () => {
            try {
                setIsLoading(true);
                const response = await organisationRequests.listOrganisation({ pageInfo: { pageIndex: 0, pageSize: 40 }, order: "asc" });
                setOrganisations(Array.isArray(response.organisations) ? response.organisations : [])
            } catch (err) {
                console.error("fetchOrganisations - error: ", err);
            } finally { setIsLoading(false); }
        }
        fetchOrganisations();
    }, []);

    return (
        <>
            {modalVersion === 'create-organisation' && (
                <CreateProjectModal modalVersion={modalVersion} setModalVersion={setModalVersion} />
            )}

            <Navbar bg="dark" variant="dark" expand="lg" fixed="top" className='px-5'>
                <DropdownButton
                    as={ButtonGroup}
                    variant={'primary'}
                    title={selectedOrganisation?.name ?? "Create Organisation..."}
                    onSelect={(selectedKey) => {
                        if (!selectedKey) { return; }
                        if (selectedKey === "create") { setModalVersion('create-organisation') }
                        else {
                            setSelectedOrganisation(organisations?.find((org) => org._id === selectedKey) ?? null);
                            navigate('/');
                        }
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
                            {userData?.username ?? "UNDEFINED"}
                        </span>
                    </Button>
                    <div className='ms-4'>
                        <Button variant="danger" className="text-light" onClick={() => alert("LOGGIN OUT")}>
                            <i className="bi bi-box-arrow-right fs-4"></i>
                        </Button>
                    </div>
                </Nav>
            </Navbar>
        </>
    );
};

export default Menu;
