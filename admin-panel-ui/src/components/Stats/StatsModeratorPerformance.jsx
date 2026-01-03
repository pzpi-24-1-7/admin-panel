import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function StatsModeratorPerformance() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/stats/moderator-performance")
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="mt-4 card">
      <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
        <h4 className="m-0">Ефективність Модераторів</h4>
        <Link to="/" className="btn btn-sm btn-light">
          На головну
        </Link>
      </div>
      <div className="card-body">
        {loading && <p>Завантаження...</p>}
        {!loading && (
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Модератор</th>
                <th>Всього дій</th>
                <th>Банів 🚫</th>
                <th>Попереджень ⚠️</th>
                <th>Остання активність</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row, i) => (
                <tr key={i}>
                  <td>{row.full_name}</td>
                  <td className="fw-bold">{row.total_actions}</td>
                  <td className="text-danger">{row.bans_issued}</td>
                  <td className="text-warning">{row.warnings_issued}</td>
                  <td>{new Date(row.last_active).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
export default StatsModeratorPerformance;
