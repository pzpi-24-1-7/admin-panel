import React, { useState, useEffect } from "react";
import api from "./api";
import { Link } from "react-router-dom";

function StatsModActions() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [moderatorId, setModeratorId] = useState("all");

  const [moderators, setModerators] = useState([]);

  const [stats, setStats] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRefs, setLoadingRefs] = useState(true);

  useEffect(() => {
    const fetchModerators = async () => {
      setLoadingRefs(true);
      try {
        const response = await api.get("/moderators");
        setModerators(response.data);
      } catch (err) {
        console.error("Error fetching moderators:", err);
        setError("Не вдалося завантажити список модераторів для фільтру.");
      } finally {
        setLoadingRefs(false);
      }
    };
    fetchModerators();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setStats([]);

    const params = {
      startDate: startDate || null,
      endDate: endDate || null,
      moderatorId:
        moderatorId === "all" || !moderatorId ? null : parseInt(moderatorId),
    };

    try {
      const response = await api.post("/stats/moderator-actions", params);
      setStats(response.data);
      if (response.data.length === 0) {
        setError("За вибраними критеріями нічого не знайдено.");
      }
    } catch (err) {
      console.error("Error fetching mod action stats:", err);
      setError("Не вдалося завантажити статистику дій.");
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4>Статистика дій модераторів</h4>
        <Link to="/" className="btn btn-sm btn-secondary">
          На головну
        </Link>
      </div>
      <div className="card-body">
        <form
          onSubmit={handleSubmit}
          className="row g-3 mb-4 p-3 border rounded bg-light"
        >
          <div className="col-md-4">
            <label htmlFor="startDate" className="form-label">
              Дата "З"
            </label>
            <input
              type="date"
              className="form-control"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="endDate" className="form-label">
              Дата "ПО"
            </label>
            <input
              type="date"
              className="form-control"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="moderatorSelect" className="form-label">
              Модератор
            </label>
            <select
              id="moderatorSelect"
              className="form-select"
              value={moderatorId}
              onChange={(e) => setModeratorId(e.target.value)}
              disabled={loadingRefs}
            >
              <option value="all">-- Всі модератори --</option>
              {moderators.map((mod) => (
                <option key={mod.moderator_id} value={mod.moderator_id}>
                  {mod.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || loadingRefs}
            >
              {loading ? "Завантаження..." : "Отримати дані"}
            </button>
          </div>
        </form>

        {loading && <p>Оновлення статистики...</p>}
        {error && !loading && (
          <div className="alert alert-warning">{error}</div>
        )}
        {!loading && stats.length > 0 && (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Ім'я модератора</th>
                <th>Кількість дій</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row) => (
                <tr key={row.full_name}>
                  <td>{row.full_name}</td>
                  <td>{row.action_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default StatsModActions;
