// import React from 'react';
import { Outlet } from 'react-router-dom';
import Menu from './header/Menu';
import { OrganisationsContextProvider } from '../customHooks/useOrganisationsContext';
import { memo } from 'react';
import Footer from './footer/Footer';

const Layout = () => {
    return (
        <OrganisationsContextProvider>
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <header>
                    <Menu />
                </header>
                {/* Bootstrap Navbar default height  */}
                <main style={{ marginTop: '56px', paddingTop: '10px', flex: 1 }}>
                    <Outlet />
                </main>
                <Footer />
            </div>
        </OrganisationsContextProvider>
    );
}

export default memo(Layout);