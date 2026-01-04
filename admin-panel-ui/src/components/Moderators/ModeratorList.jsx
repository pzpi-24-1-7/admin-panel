import React, { useState, useEffect } from "react";
import api from "../../api";
import { Link } from "react-router-dom";

function ModeratorList() {
  const [moderators, setModerators] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchModerators = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/moderators");
        setModerators(response.data);
      } catch (err) {
        console.error("Error fetching moderators:", err);
        setError("Не вдалося завантажити дані про модераторів.");
        setModerators([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModerators();
  }, [refreshTrigger]);

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Ви впевнені, що хочете видалити модератора ${name} (ID: ${id})? Це не можна буде скасувати.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/moderators/${id}`);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error deleting moderator:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(`Помилка видалення: ${err.response.data.error}`);
      } else {
        setError("Не вдалося видалити модератора.");
      }
    }
  };

  if (loading)
    return <div className="text-center mt-3">Завантаження модераторів...</div>;

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Список модераторів</h2>
        <Link to="/moderators/add" className="btn btn-success">
          Додати модератора
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Логін</th>
            <th>Email</th>
            <th>ПІБ</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {moderators.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                Модераторів не знайдено.
              </td>
            </tr>
          ) : (
            moderators.map((moderator) => (
              <tr key={moderator.moderator_id}>
                <td>{moderator.moderator_id}</td>
                <td>{moderator.login}</td>
                <td>{moderator.email}</td>
                <td>{moderator.full_name}</td>
                <td>
                  <Link
                    to={`/moderators/${moderator.moderator_id}/actions`}
                    className="btn btn-sm btn-info me-2"
                    state={{ moderatorName: moderator.full_name }}
                  >
                    Дії
                  </Link>

                  <Link
                    to={`/moderators/edit/${moderator.moderator_id}`}
                    className="btn btn-sm btn-success me-2"
                  >
                    Оновити
                  </Link>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() =>
                      handleDelete(moderator.moderator_id, moderator.full_name)
                    }
                  >
                    Видалити
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ModeratorList;
