import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, get, update, remove, push } from "firebase/database";
import { app } from '../../firebase';

export default function FirebaseCRUD() {
    const database = getDatabase(app);
    const [users, setUsers] = useState([]);
    const [userInput, setUserInput] = useState({ username: '', email: '', id: null }); // Added 'id' for update reference

    useEffect(() => {
        fetchUsers();
    }, []);

    function createUser() {
        if (userInput.id) {
            updateUser(userInput.id);
            return;
        }

        const newUserRef = push(ref(database, 'users'));
        set(newUserRef, {
            username: userInput.username,
            email: userInput.email,
        })
            .then(() => {
                console.log("User created successfully!");
                setUserInput({ username: '', email: '', id: null });
                fetchUsers();
            })
            .catch((error) => {
                console.error("Error creating user:", error);
            });
    }


    function fetchUsers() {
        get(ref(database, 'users'))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const formattedData = Object.entries(data).map(([id, value]) => ({
                        id,
                        ...value,
                    }));
                    setUsers(formattedData);
                } else {
                    setUsers([]);
                }
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
            });
    }

    function updateUser(userId) {
        update(ref(database, `users/${userId}`), {
            username: userInput.username,
            email: userInput.email,
        })
            .then(() => {
                console.log("User updated successfully!");
                setUserInput({ username: '', email: '', id: null });
                fetchUsers();
            })
            .catch((error) => {
                console.error("Error updating user:", error);
            });
    }


    function deleteUser(userId) {
        remove(ref(database, `users/${userId}`))
            .then(() => {
                console.log("User deleted successfully!");
                fetchUsers();
            })
            .catch((error) => {
                console.error("Error deleting user:", error);
            });
    }

    function editUser(user) {
        setUserInput({ username: user.username, email: user.email, id: user.id });
    }

    return (
        <div>
            <h1>Firebase CRUD Operations</h1>

            <div>
                <input
                    type="text"
                    placeholder="Username"
                    value={userInput.username}
                    onChange={(e) => setUserInput({ ...userInput, username: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={userInput.email}
                    onChange={(e) => setUserInput({ ...userInput, email: e.target.value })}
                />
                <button onClick={createUser}>{userInput.id ? "Update User" : "Add User"}</button>
            </div>

            <h2>User List</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        <p>Username: {user.username}</p>
                        <p>Email: {user.email}</p>
                        <button onClick={() => editUser(user)}>Edit</button>
                        <button onClick={() => deleteUser(user.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
