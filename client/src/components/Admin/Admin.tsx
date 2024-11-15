import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Admin.module.css";

interface User {
  id: string;
  userName: string;
  displayName: string;
  role: string;
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: "0",
      userName: "Tomáš Kalhous",
      displayName: "Tomik",
      role: "USER",
    },
    {
      id: "1",
      userName: "Jana Nováková",
      displayName: "Janička",
      role: "ADMIN",
    },
    {
      id: "2",
      userName: "Petr Svoboda",
      displayName: "Péťa",
      role: "USER",
    },
  ]);

  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    // Simulating API call
    console.log(`Deleting user with id: ${id}`);
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  };

  return (
    <div className={styles.container}>
      <button className={styles.goBack} onClick={() => navigate("/map")}>
        Go back
      </button>
      <h1>Admin Pane</h1>
      <p>User Overview</p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>User Name</th>
            <th>Display Name</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.userName}</td>
              <td>{user.displayName}</td>
              <td>{user.role}</td>
              <td>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
