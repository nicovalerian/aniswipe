import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

function UserSelector() {
    const { users, currentUser, loading, error, selectUser, createUser } = useUser();
    const [newUserEmail, setNewUserEmail] = useState('');

    const handleSelectChange = (event) => {
        selectUser(event.target.value);
    };

    const handleCreateUser = async (event) => {
        event.preventDefault();
        if (!newUserEmail) return;
        const created = await createUser(newUserEmail);
        if (created) {
            setNewUserEmail(''); // Clear input on success
            // Optionally automatically select the new user if desired
            // selectUser(created.id);
        }
    };

    return (
        <div>
            <h2>Select or Create User</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            <label htmlFor="userSelect">Select Existing User: </label>
            <select
                id="userSelect"
                onChange={handleSelectChange}
                value={currentUser ? currentUser.id : ''}
                disabled={loading}
            >
                <option value="">-- Select User --</option>
                {users.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.email}
                    </option>
                ))}
            </select>

            <form onSubmit={handleCreateUser} style={{ marginTop: '1em' }}>
                <label htmlFor="newUserEmail">Create New User (Email): </label>
                <input
                    type="email"
                    id="newUserEmail"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="new.user@example.com"
                    required
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>Create User</button>
            </form>

            {currentUser && <p>Current User: {currentUser.email} (ID: {currentUser.id})</p>}
        </div>
    );
}

export default UserSelector;