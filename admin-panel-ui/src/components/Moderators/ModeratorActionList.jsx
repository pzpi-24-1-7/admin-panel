// src/components/ModeratorActionList.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
// 1. Імпортуємо хуки для роботи з роутером
import { useParams, useLocation, Link } from "react-router-dom";

// 2. Видаляємо пропси moderatorId та moderatorName
function ModeratorActionList() {
  // 3. Отримуємо параметри з URL. :id в App.jsx -> { id: "..." }
  const { id } = useParams();
  // 4. Отримуємо 'location', щоб дістати 'state' (ім'я, яке ми передали)
  const location = useLocation();

  const moderatorId = id; // ID модератора з URL
  const moderatorName = location.state?.moderatorName; // Ім'я зі state (?. - опціонально)

  const [actions, setActions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // 5. Встановлюємо true, бо завантаження починається одразу

  useEffect(() => {
    // 6. Якщо ID з якоїсь причини немає, не робимо запит
    if (!moderatorId) {
      setLoading(false);
      setError("ID модератора не знайдено в URL.");
      return;
    }

    const fetchActions = async () => {
      setLoading(true);
      setError(null);
      try {
        // 7. Робимо запит, використовуючи moderatorId з URL
        const response = await axios.get(
          `http://localhost:3001/api/moderators/${moderatorId}/actions`
        );
        setActions(response.data);
      } catch (err) {
        console.error(
          `Error fetching actions for moderator ${moderatorId}:`,
          err
        );
        // 8. Використовуємо ID у повідомленні про помилку, якщо ім'я не передалося
        setError(
          `Не вдалося завантажити дії для модератора ${
            moderatorName || `ID ${moderatorId}`
          }.`
        );
        setActions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, [moderatorId]); // 9. Ефект тепер залежить від moderatorId з URL

  // 10. `if (!moderatorId)` більше не потрібен тут, бо це тепер ціла сторінка

  return (
    <div className="mt-4 card">
      <div className="card-header d-flex justify-content-between align-items-center">
        {/* 11. Показуємо ім'я (якщо є) або ID */}
        <h4>Дії модератора: {moderatorName || `ID ${moderatorId}`}</h4>
        {/* 12. Посилання "Назад" */}
        <Link to="/moderators" className="btn btn-sm btn-secondary">
          Назад до списку
        </Link>
      </div>
      <div className="card-body">
        {loading && <p>Завантаження дій...</p>}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && (
          // ... (вся розмітка таблиці <table>...</table> залишається без змін) ...
          <table className="table table-sm table-bordered">
            <thead>
              <tr>
                <th>ID Дії</th>
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
                  <td colSpan="7" className="text-center">
                    Дій для цього модератора не знайдено.
                  </td>
                </tr>
              ) : (
                actions.map((action) => (
                  <tr key={action.moderator_action_id}>
                    <td>{action.moderator_action_id}</td>
                    <td>{action.target_user_id ?? "N/A"}</td>
                    <td>{action.action_name}</td>
                    <td>{action.complaint_id ?? "N/A"}</td>
                    <td>{action.reason_text}</td>
                    <td>{new Date(action.action_at).toLocaleDateString()}</td>
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
        )}
      </div>
    </div>
  );
}

export default ModeratorActionList;
