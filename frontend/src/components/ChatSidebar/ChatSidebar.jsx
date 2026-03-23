import React, { useEffect, useState } from 'react';
import styles from './ChatSidebar.module.css';

const API_BASE_URL = "http://localhost:5000/api";

export default function ChatSidebar({ 
  currentSessionId, 
  onSelectSession, 
  onNewSession,
  moduleType 
}) {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/conversations`);
      if (res.ok) {
        const data = await res.json();
        // optionally filter by moduleType
        setConversations(data.filter(c => !moduleType || c.moduleType === moduleType));
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // Poll for new titles or updates every 10 seconds just in case
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [moduleType, currentSessionId]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this conversation?")) return;
    
    try {
      await fetch(`${API_BASE_URL}/conversations/${id}`, { method: 'DELETE' });
      setConversations(prev => prev.filter(c => c._id !== id));
      if (currentSessionId === id) {
        onNewSession();
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  return (
    <div className={styles.sidebarBorder}>
      <div className={styles.sidebarContainer}>
        <button className={styles.newChatBtn} onClick={onNewSession}>
          <span className={styles.plusIcon}>+</span> New Chat
        </button>

        <div className={styles.listContainer}>
          {isLoading && conversations.length === 0 ? (
            <div className={styles.loadingMsg}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div className={styles.emptyMsg}>No history found.</div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv._id} 
                className={`${styles.chatItem} ${conv._id === currentSessionId ? styles.active : ''}`}
                onClick={() => onSelectSession(conv._id)}
              >
                <div className={styles.chatInfo}>
                  <p className={styles.chatTitle}>{conv.title}</p>
                  <p className={styles.chatDate}>
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  className={styles.deleteBtn}
                  onClick={(e) => handleDelete(e, conv._id)}
                  title="Delete Conversation"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
