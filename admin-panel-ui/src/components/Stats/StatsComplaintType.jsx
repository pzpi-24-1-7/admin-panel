import React, { useState, useEffect } from "react";
import api from "../../api";
import { Link } from "react-router-dom";

function StatsComplaintType() {
  const [stats, setStats] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/stats/complaints-by-type-status");
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching  complaint stats:", err);
        setError("Не вдалося завантажити статистику скарг.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p>Завантаження статистики...</p>;

  return (
    <div className="mt-4 card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4>Статистика скарг за типом та статусом</h4>
        <Link to="/" className="btn btn-sm btn-secondary">
          На головну
        </Link>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Тип скарги</th>
              <th>Статус</th>
              <th>Кількість</th>
            </tr>
          </thead>
          <tbody>
            {stats.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center">
                  Даних не знайдено.
                </td>
              </tr>
            ) : (
              stats.map((row, index) => (
                <tr key={index}>
                  <td>{row.type_name}</td>
                  <td>{row.status}</td>
                  <td>{row.count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StatsComplaintType;
