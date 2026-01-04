import React, { useState, useEffect } from "react";
import api from "../../api";
import { Link } from "react-router-dom";

function StatsViolationTrends() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/stats/violation-trends")
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="mt-4 card">
      <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
        <h4 className="m-0">Тренди порушень</h4>
        <Link to="/" className="btn btn-sm btn-light">
          На головну
        </Link>
      </div>
      <div className="card-body">
        {loading && <p>Завантаження...</p>}
        {!loading && (
          <table className="table">
            <thead>
              <tr>
                <th>Тип порушення</th>
                <th>Кількість</th>
                <th>Частка (%)</th>
                <th>Необроблені</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row, i) => (
                <tr key={i}>
                  <td className="fw-bold">{row.type_name}</td>
                  <td>{row.total_complaints}</td>
                  <td>
                    <div className="progress" style={{ height: "20px" }}>
                      <div
                        className="progress-bar bg-warning text-dark"
                        role="progressbar"
                        style={{ width: `${row.percentage}%` }}
                      >
                        {row.percentage}%
                      </div>
                    </div>
                  </td>
                  <td className="text-danger fw-bold">{row.pending_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
export default StatsViolationTrends;
