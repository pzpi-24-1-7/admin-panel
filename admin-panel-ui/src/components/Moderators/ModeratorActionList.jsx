import React, { useState, useEffect } from "react";
import api from "./api";
import { useParams, useLocation, Link } from "react-router-dom";

function ModeratorActionList() {
  const { id } = useParams();
  const location = useLocation();

  const moderatorId = id;
  const moderatorName = location.state?.moderatorName;

  const [actions, setActions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!moderatorId) {
      setLoading(false);
      setError("ID модератора не знайдено в URL.");
      return;
    }

    const fetchActions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/moderators/${moderatorId}/actions`);
        setActions(response.data);
      } catch (err) {
        console.error(
          `Error fetching actions for moderator ${moderatorId}:`,
          err
        );
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
  }, [moderatorId]);

  return (
    <div className="mt-4 card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4>Дії модератора: {moderatorName || `ID ${moderatorId}`}</h4>
        <Link to="/moderators" className="btn btn-sm btn-secondary">
          Назад до списку
        </Link>
      </div>
      <div className="card-body">
        {loading && <p>Завантаження дій...</p>}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && (
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
