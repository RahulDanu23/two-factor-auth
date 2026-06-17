/* eslint-disable react-refresh/only-export-components */
import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.DEV ? 'http://localhost:5000' : import.meta.env.VITE_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(null);

    const authState = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/auth/is-auth', { withCredentials: true });
            if (data.success) {
                setUserData(data.userData);
                setIsLoggedin(true);
            } else {
                setUserData(null);
                setIsLoggedin(false);
            }
        } catch (error) {
            console.log(error);
            setUserData(null);
            setIsLoggedin(false);
        }
    };

    const getUserData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/data', { withCredentials: true });
            if (data.success) {
                setUserData(data.userData);
                setIsLoggedin(true);
            } else {
                toast.error(data.message);
                setUserData(null);
                setIsLoggedin(false);
            }
        } catch (error) {
            toast.error(error.message);
            setUserData(null);
            setIsLoggedin(false);
        }
    };

    // Check auth state when app loads
    useEffect(() => {
        authState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = {
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData,
        authState
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
