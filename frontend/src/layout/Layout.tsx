// import React from 'react';
import { Outlet } from 'react-router-dom';
import Menu from './header/Menu';

function Layout() {
    return (
        <div>
            <header>
                <Menu />
            </header>
            {/* Bootstrap Navbar default height  */}
            <main style={{ marginTop: '56px', paddingTop: '10px' }}>
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;