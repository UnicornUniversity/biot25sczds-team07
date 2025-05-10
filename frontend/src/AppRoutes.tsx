import React from 'react';
import { Routes, Route } from 'react-router-dom';


import Layout from './layout/Layout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFoundPage from '../pages/NotFoundPage';


import Dashboard from './views/dashboard-view/Dashboard';
import UserProfile from './views/users-view/User';
import { useLoggedUserContext } from './customHooks/useLoggedUserContext';


// Separate the route logic into its own component
const AppRoutes = React.memo(() => {
    const { userData } = useLoggedUserContext();

    return (
        <Routes>
            {userData ? (
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="/user/:userId" element={<UserProfile />} />
                    <Route path="/register" element={<Register />} />
                </Route>
            ) : (
                <>
                    <Route index element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </>
            )}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
});

export default AppRoutes;
