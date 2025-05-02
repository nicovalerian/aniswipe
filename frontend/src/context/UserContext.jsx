import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; // Make sure axios is installed

const API_URL = 'http://localhost:5000/api'; // Your backend URL

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null); // Store the selected user object {id, email}
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
             const response = await axios.post(`${API_URL}/users`, { email });
             const newUser = response.data;
             setUsers([...users, newUser]); // Add to list
             setCurrentUser(newUser); // Optionally set as current user right away
             return newUser; // Return the created user
         } catch (err) {
             console.error("Error creating user:", err.response?.data?.error || err.message);
             setError(err.response?.data?.error || 'Failed to create user.');
             return null; // Indicate failure
         } finally {
             setLoading(false);
         }
     };

    // Fetch users on initial load
    useEffect(() => {
        fetchUsers();
    }, []);

    // Function to select a user from the list
    const selectUser = (userId) => {
        const user = users.find(u => u.id === parseInt(userId));
        setCurrentUser(user || null);
    };

    return (
        <UserContext.Provider value={{ users, currentUser, loading, error, fetchUsers, selectUser, createUser }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to use the UserContext
// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => useContext(UserContext);