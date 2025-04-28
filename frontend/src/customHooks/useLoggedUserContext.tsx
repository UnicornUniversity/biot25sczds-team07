import React, { createContext, useContext, useState, useEffect, FC, ReactNode } from 'react';
import { redirect } from 'react-router-dom';
import userRequests, { AuthorizeUserDtoIn, User } from '../../API/requests/userRequests';

interface UserDataContext {
    userData: User | null;
    setUserData: React.Dispatch<React.SetStateAction<User | null>>;
    loginUser: (credentials: AuthorizeUserDtoIn) => Promise<User | false>;
    logoutUser: () => void;
}

// Create a context for user data
const UserContext = createContext<UserDataContext | null>(null);



// Create a custom hook to access the user context
export const useLoggedUserContext = () => {
    const context = useContext(UserContext);
    if (!context) { throw new Error("useLoggedUserContext must be used within a UserProvider"); }
    return context;
};

// Create a UserProvider component to wrap your app with
export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [userData, setUserData] = useState<User | null>(null);

    const loginUser = async (credentials: AuthorizeUserDtoIn) => {
        try {
            const result = await userRequests.authorize(credentials);
            console.log("loginUser - result: ", result);
            if ("token" in result && typeof result.token === "string" && result.token.length > 5) {
                localStorage.setItem("JWTtoken", result.token);
            }
            if ("_id" in result) {
                setUserData(result);
                return result;
            }
            return false;
        } catch (err) {
            console.error("failed to login user: ", err);
            return false;
        }
    }

    const logoutUser = () => {
        console.log("logoutUser");
        setUserData(null);
        localStorage.removeItem("JWTtoken");
    }

    useEffect(() => {
        console.log(`user changed to: `, userData);
        if (!userData) { redirect("/login") }

    }, [userData]);

    // You can define functions to set or update the user data here
    return (
        <UserContext.Provider
            value={{
                userData, setUserData,
                loginUser, logoutUser
            }}
        >
            {children}
        </UserContext.Provider>
    );
};
