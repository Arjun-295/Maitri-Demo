import React from "react";
import { Link } from "react-router-dom";

export default function Test() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🧪 Test Page</h1>
        <p style={styles.message}>
          ✅ If you can see this, React Router is working correctly!
        </p>
        
        <div style={styles.info}>
          <h3 style={styles.infoTitle}>Application Status</h3>
          <ul style={styles.list}>
            <li>✅ React is running</li>
            <li>✅ React Router DOM is configured</li>
            <li>✅ Routing is functional</li>
          </ul>
        </div>

        <Link to="/" style={styles.link}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    padding: "20px",
  },
  card: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "40px",
    textAlign: "center",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    maxWidth: "500px",
    width: "100%",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "20px",
    color: "#fff",
    textShadow: "0 2px 10px rgba(255, 255, 255, 0.2)",
  },
  message: {
    fontSize: "1.2rem",
    color: "#4ade80",
    marginBottom: "30px",
    fontWeight: "500",
  },
  info: {
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "30px",
  },
  infoTitle: {
    color: "#fff",
    marginBottom: "15px",
    fontSize: "1.1rem",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    textAlign: "left",
    color: "#e2e8f0",
  },
  link: {
    display: "inline-block",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "30px",
    fontWeight: "600",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  },
};
