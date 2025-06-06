import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; // Make sure axios is installed

const API_URL = 'http://localhost:5000/api'; // Your backend URL

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null); // Store the selected user object {id, email}
    const [token, setToken] = useState(localStorage.getItem('token')); // Store JWT token
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_URL}/users`);
            setUsers(response.data);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError('Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    const createUser = async (email) => {
         setLoading(true);
         setError('');
         try {
             // Add password if your API expects it
             // Assuming the backend returns a user object and a token upon creation
             const response = await axios.post(`${API_URL}/users`, { email, username: email.split('@')[0] }); // Assuming username from email for simplicity
             const { user, token } = response.data;
             localStorage.setItem('token', token);
             setToken(token);
             setCurrentUser(user);
             fetchUsers(); // Refresh the user list after creating a new user
             return user; // Return the created user
         } catch (err) {
             console.error("Error creating user:", err.response?.data?.error || err.message);
             setError(err.response?.data?.error || 'Failed to create user.');
             return null; // Indicate failure
         } finally {
             setLoading(false);
         }
     };

    // Check for a token in local storage on initial load
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            // Validate token with backend and fetch user data if valid
            // For now, we'll just set the token and assume validity.
            // A real app would have an endpoint to verify the token and return user info.
            setToken(storedToken);
            // Optionally, fetch current user details if token is valid
            // fetchCurrentUser(storedToken);
        }
        fetchUsers(); // Still fetch users for the UserSelector component
    }, []);

    // Effect to update currentUser based on token (simplified for now)
    useEffect(() => {
        if (token) {
            // In a real app, you'd decode the token or hit an endpoint to get user details
            // For this example, let's assume we can derive user from the token or keep it simple
            // If the backend sends user info with login/register, that would be set directly.
            // If the token is the single source of truth, you'd fetch user here.
            // For now, currentUser is set by loginUser/createUser directly.
        } else {
            setCurrentUser(null);
        }
    }, [token]);

    // Function to select a user from the list (acts as a "login" for existing users)
    const loginUser = async (userId) => {
        setLoading(true);
        setError('');
        try {
            // In a real app, this would involve sending credentials to a login endpoint
            // and receiving a token and user object.
            const user = users.find(u => u.id === parseInt(userId));
            if (user) {
                // For this simplified example, we don't have a login endpoint,
                // so we just set the current user and a dummy token.
                // In a real app:
                // const response = await axios.post(`${API_URL}/login`, { userId }); // or email/password
                // const { user, token } = response.data;
                const dummyToken = `dummy-token-for-user-${user.id}`; // Replace with actual token from backend
                localStorage.setItem('token', dummyToken);
                setToken(dummyToken);
                setCurrentUser(user);
                return user; // This user object now contains username from backend
            } else {
                setError('User not found.');
                return null;
            }
        } catch (err) {
            console.error("Error logging in:", err.response?.data?.error || err.message);
            setError(err.response?.data?.error || 'Failed to login.');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const logoutUser = () => {
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
        setError(''); // Clear any previous errors on logout
    };

    return (
        <UserContext.Provider value={{ users, currentUser, loading, error, fetchUsers, createUser, loginUser, logoutUser }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to use the UserContext
// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => useContext(UserContext);