import { useState } from "react";

function Login({ onLogin }) {
    const [name, setName] = useState("");
    const [role, setRole] = useState("helper");

    const handleLogin = () => {
        if (!name) return;
        onLogin({ name, role });
    };

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg,#0f172a,#020617)",
                color: "white",
            }}
        >
            <h2>RoadSOS Login</h2>

            <input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                    padding: "10px",
                    margin: "10px",
                    borderRadius: "8px",
                    border: "none",
                }}
            />

            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                    padding: "10px",
                    margin: "10px",
                    borderRadius: "8px",
                }}
            >
                <option value="helper">Helper</option>
                <option value="police">Police</option>
                <option value="hospital">Hospital</option>
            </select>

            <button
                onClick={handleLogin}
                style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#ff4d4d",
                    color: "white",
                    cursor: "pointer",
                }}
            >
                Login
            </button>
        </div>
    );
}

export default Login;