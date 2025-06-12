import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/toast";

const AdminDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [numUsers, setNumUsers] = useState(0);
  const [numExports, setNumExports] = useState(0);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const getUsersCount = async () => {
    const token = await getToken();
    if (!token) {
      navigate("/auth");
    }
    fetch(`${import.meta.env.VITE_SERVER_URL}/api/user/num-users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials:"include"
    })
      .then(async (res) => {
        const result = await res.json();
        setNumUsers(result.numUsers);
      })
      .catch(() => {
        navigate("/auth");
      });
  };
  const getExportsCount = async () => {
    const token = await getToken();
    if (!token) {
      navigate("/auth");
    }
    fetch(`${import.meta.env.VITE_SERVER_URL}/api/user/num-exports`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials:"include"
    })
      .then(async (res) => {
        const result = await res.json();
        setNumExports(result.numExports);
      })
      .catch(() => {
        navigate("/auth");
      });
  };
  const getTopTenFeedbacks = async () => {
    const token = await getToken();
    if (!token) {
      navigate("/auth");
    }
    fetch(`${import.meta.env.VITE_SERVER_URL}/api/user/feedbacks`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials:"include"
    })
      .then(async (res) => {
        const result = await res.json();        
        setFeedbacks(result.feedbacks);
      })
      .catch(() => {
        navigate("/auth");
      });
  };

  const checkAdmin = async () => {
    const token = await getToken();
    if (!token) {
      navigate("/auth");
    }
    fetch(`${import.meta.env.VITE_SERVER_URL}/api/user/check-admin`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials:"include"
    })
      .then(async (res) => {
        const result = await res.json();
        if (!result.isAdmin) {
          notify("Something went wrong", "error");
          navigate("/auth");
        } else {
          getExportsCount();
          getUsersCount();
          getTopTenFeedbacks();
        }
      })
      .catch((err) => {
        navigate("/auth");
      });
  };

  useEffect(() => {
    //check admin
    checkAdmin();
  }, []);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>Number of users: {numUsers}</h1>
      <h1>Number of exports: {numExports}</h1>

      <h1>Top ten feedbacks</h1>
      <table
        style={{
          width: "60%",
          borderCollapse: "collapse",
          backgroundColor: "#fffbe6", // cream background
          color: "#333",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#f9f5d7", // slightly darker cream
              fontWeight: "bold",
              borderBottom: "2px solid #ccc",
            }}
          >
            <th style={{ padding: "12px", textAlign: "left" }}>Date</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Feedback</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks?.map((item, index) => (
            <tr
              key={index}
              style={{
                borderBottom: "1px solid #ddd",
                backgroundColor: index % 2 === 0 ? "#ffffff" : "#fdfae3",
              }}
            >
              <td style={{ padding: "10px" }}>{item.created_at}</td>
              <td style={{ padding: "10px" }}>{item.email}</td>
              <td style={{ padding: "10px" }}>{item.feedback}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
