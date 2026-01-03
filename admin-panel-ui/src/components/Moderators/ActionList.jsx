import React, { useState, useEffect } from "react";
import axios from "axios";

function ActionList({ refreshTrigger }) {
  const [actions, setActions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Запрос на новый эндпоинт для ВСЕХ действий
        const response = await axios.get("http://localhost:3001/api/actions");
        setActions(response.data);
      } catch (err) {
        console.error("Error fetching actions:", err);
        setError("Не вдалося завантажити дії модераторів.");
        setActions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchActions();
  }, [refreshTrigger]);

  if (loading) return <p>Завантаження дій модераторів...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="mt-4">
      <h2>Список дій модераторів</h2>
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>ID Дії</th>
            <th>Модератор</th>
            <th>ID Порушника</th>
            <th>Тип Дії</th>
            <th>ID Скарги</th>
            <th>Причина</th>
            <th>Дата Дії</th>
            <th>Дата Закінчення</th>
          </tr>
        </thead>
        <tbody>
          {actions.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                Дій не знайдено.
              </td>
            </tr>
          ) : (
            actions.map((action) => (
              <tr key={action.moderator_action_id}>
                <td>{action.moderator_action_id}</td>
                <td>{action.moderator_name}</td> {/* Имя из JOIN */}
                <td>{action.target_user_id ?? "N/A"}</td>
                <td>{action.action_name}</td> {/* Имя из JOIN */}
                <td>{action.complaint_id ?? "N/A"}</td>
                <td title={action.reason_text}>
                  {action.reason_text
                    ? `${action.reason_text.substring(0, 30)}...`
                    : "-"}
                </td>
                <td>{new Date(action.action_at).toLocaleString()}</td>
                <td>
                  {action.expires_at
                    ? new Date(action.expires_at).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ActionList;
