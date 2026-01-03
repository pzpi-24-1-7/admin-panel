import React, { useState, useEffect } from "react";
import api from "./api";

function UserChatViewer({ userId }) {
  const [chats, setChats] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // 1. Завантаження списку чатів при монтуванні
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get(`/manage/users/${userId}/chats`);
        setChats(res.data);
      } catch (err) {
        console.error("Error loading chats");
      }
    };
    if (userId) fetchChats();
  }, [userId]);

  // 2. Завантаження повідомлень при кліку на співрозмовника
  const loadMessages = async (partnerId) => {
    if (selectedPartner === partnerId) {
      setSelectedPartner(null); // Закрити, якщо вже відкрито
      return;
    }
    setSelectedPartner(partnerId);
    setLoadingMessages(true);
    try {
      const res = await api.get(`/manage/users/${userId}/chats/${partnerId}`);
      setMessages(res.data);
    } catch (err) {
      alert("Помилка завантаження повідомлень");
    } finally {
      setLoadingMessages(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header bg-info text-white">Історія Листування</div>
      <div className="card-body p-0">
        {chats.length === 0 ? (
          <div className="p-3 text-muted text-center">
            Користувач ще ні з ким не спілкувався.
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {chats.map((chat) => (
              <div key={chat.partner_id} className="list-group-item">
                {/* Заголовок чата (Співрозмовник) */}
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => loadMessages(chat.partner_id)}
                  style={{ cursor: "pointer" }}
                >
                  <div>
                    <strong>{chat.partner_login}</strong>{" "}
                    <small className="text-muted">({chat.partner_email})</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <small className="text-muted me-3">
                      {new Date(chat.last_message_at).toLocaleDateString()}
                    </small>
                    <button className="btn btn-sm btn-outline-primary">
                      {selectedPartner === chat.partner_id ? "▲" : "▼"}
                    </button>
                  </div>
                </div>

                {/* Область повідомлень (Розгортається) */}
                {selectedPartner === chat.partner_id && (
                  <div
                    className="mt-3 p-3 border rounded bg-light"
                    style={{ maxHeight: "300px", overflowY: "auto" }}
                  >
                    {loadingMessages ? (
                      <div className="text-center">Завантаження...</div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.message_id}
                          className={`d-flex flex-column mb-2 ${
                            msg.sender_user_id == userId
                              ? "align-items-end"
                              : "align-items-start"
                          }`}
                        >
                          <div
                            className={`p-2 rounded text-white ${
                              msg.sender_user_id == userId
                                ? "bg-primary"
                                : "bg-secondary"
                            }`}
                            style={{ maxWidth: "75%", fontSize: "0.9rem" }}
                          >
                            <div
                              className="fw-bold border-bottom border-white mb-1"
                              style={{ fontSize: "0.7em" }}
                            >
                              {msg.sender_login}
                            </div>
                            {msg.message_text}
                          </div>
                          <small
                            className="text-muted"
                            style={{ fontSize: "0.7em" }}
                          >
                            {new Date(msg.sent_at).toLocaleString()}
                          </small>
                        </div>
                      ))
                    )}
                    {messages.length === 0 && (
                      <p className="text-center text-muted">
                        Повідомлень немає.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserChatViewer;
