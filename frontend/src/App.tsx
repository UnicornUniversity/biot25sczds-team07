import NotFoundPage from '../pages/NotFoundPage';
import Login from '../pages/Login';
import Register from '../pages/Register';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { MainProvider } from './customHooks/useMainContext';
import { useLoggedUserContext } from './customHooks/useLoggedUserContext';

import Layout from './layout/Layout';

import Dashboard from './views/dashboard-view/Dashboard';
import UserProfile from './views/users-view/User';
import Sprint from './views/sprint-view/Sprint';


const App = () => {
    const { userData } = useLoggedUserContext();

    return (
        <MainProvider>

            <Router>
                <Routes>
                    {userData
                        ? (
                            <Route path="/" element={<Layout />}>
                                <Route index element={<Dashboard />} />
                                {/* <Route path="/sprint/:sprintId" element={<Sprint />} />
                                <Route path="/user/:userId" element={<UserProfile />} /> */}
                                <Route path="/register" element={<Register />} />
                            </Route>
                        )
                        : (
                            <>
                                <Route index element={<Login />} />
                                <Route path="/register" element={<Register />} />
                            </>
                        )
                    }
                    <Route path='*' element={<NotFoundPage />} />

                </Routes>
            </Router>

        </MainProvider>
    );
}

export default App;