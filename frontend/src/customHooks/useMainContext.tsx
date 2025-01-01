import React, { createContext, useContext, ReactNode, useState } from "react";


import { useLoggedUserContext } from "./useLoggedUserContext";
import { Organisation } from "../../API/requests/organisationRequests";
// Define the context type
type MainContextType = {
    selectedOrganisation: Organisation | null
    setSelectedOrganisation: React.Dispatch<React.SetStateAction<Organisation | null>>
};

// Create the context
const MainContext = createContext<MainContextType | undefined>(undefined);

// Provider component
export const MainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { userData } = useLoggedUserContext()

    const [selectedOrganisation, setSelectedOrganisation] = useState<null | Organisation>(null);


    return (
        <MainContext.Provider
            value={{
                selectedOrganisation, setSelectedOrganisation,
            }}
        >
            {children}
        </MainContext.Provider>
    );
};

// Custom hook to use the context
export const useMainContext = (): MainContextType => {
    const context = useContext(MainContext);
    if (!context) {
        throw new Error("useMainContext must be used within a MainProvider");
    }
    return context;
};