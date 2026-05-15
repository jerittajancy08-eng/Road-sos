export default function UserDashboard({ triggerSOS }) {
    return (
        <div style={{ textAlign: "center" }}>
            <h2>User Dashboard</h2>

            <button
                onClick={triggerSOS}
                style={{
                    background: "red",
                    color: "white",
                    padding: "20px",
                    borderRadius: "50%"
                }}
            >
                SOS
            </button>
        </div>
    );
}