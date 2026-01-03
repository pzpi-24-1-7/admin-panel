import React, { useState, useEffect } from "react";
import api from "./api"
import { Link, useNavigate, useSearchParams } from "react-router-dom";

function ComplaintManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "new",
    reporter_email: searchParams.get("reporter_email") || "",
    target_email: searchParams.get("target_email") || "",
    startDate: searchParams.get("startDate") || "", // <---
    endDate: searchParams.get("endDate") || "", // <---
  });

  const [sortConfig, setSortConfig] = useState({
    sortBy: "created_at",
    sortOrder: "DESC",
  });

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async (
    currentFilters = filters,
    currentSort = sortConfig
  ) => {
    setLoading(true);
    try {
      const params = { ...currentFilters, ...currentSort };
      const response = await api.get(
        "/manage/complaints/search",
        { params }
      );
      setComplaints(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const defaultSort = { sortBy: "created_at", sortOrder: "DESC" };
    setSortConfig(defaultSort);

    fetchComplaints(filters, defaultSort);
    setSearchParams(filters);
  };

  const handleSort = (column) => {
    const newOrder =
      sortConfig.sortBy === column && sortConfig.sortOrder === "ASC"
        ? "DESC"
        : "ASC";

    const newSort = { sortBy: column, sortOrder: newOrder };
    setSortConfig(newSort);

    fetchComplaints(filters, newSort);
  };

  const getSortIcon = (column) => {
    if (sortConfig.sortBy !== column)
      return <span className="text-muted ms-1">⇅</span>;
    return sortConfig.sortOrder === "ASC" ? " ▲" : " ▼";
  };

  return (
    <div className="mt-4">
      <h3>Керування скаргами</h3>

      {/* Панель поиска */}
      <div className="card mb-3">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            {/* РЯДОК 1: Основні текстові поля */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Пошук (ID або Текст)</label>
                <input
                  type="text"
                  className="form-control"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  placeholder="Текст скарги..."
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Статус</label>
                <select
                  className="form-select"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="new">Нові</option>
                  <option value="in_progress">В роботі</option>
                  <option value="closed">Закриті</option>
                  <option value="all">Всі</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Email Скаржника</label>
                <input
                  type="text"
                  className="form-control"
                  value={filters.reporter_email}
                  onChange={(e) =>
                    setFilters({ ...filters, reporter_email: e.target.value })
                  }
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Email Порушника</label>
                <input
                  type="text"
                  className="form-control"
                  value={filters.target_email}
                  onChange={(e) =>
                    setFilters({ ...filters, target_email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* РЯДОК 2: Дати та Кнопки */}
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label">Дата (З)</label>
                <input
                  type="date"
                  className="form-control"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Дата (По)</label>
                <input
                  type="date"
                  className="form-control"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                />
              </div>

              <div className="col-md-6 d-flex gap-3">
                <button type="submit" className="btn btn-primary w-100">
                  🔍 Фільтрувати
                </button>
                <Link to="/complaints/add" className="btn btn-success w-100">
                  + Додати скаргу
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Таблица */}
      {loading ? (
        <div className="text-center my-3">Завантаження...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th
                  onClick={() => handleSort("complaint_id")}
                  style={{ cursor: "pointer" }}
                >
                  ID {getSortIcon("complaint_id")}
                </th>
                <th
                  onClick={() => handleSort("type_name")}
                  style={{ cursor: "pointer" }}
                >
                  Тип {getSortIcon("type_name")}
                </th>
                <th>Скаржник</th>
                <th>Порушник</th>
                <th
                  onClick={() => handleSort("status")}
                  style={{ cursor: "pointer" }}
                >
                  Статус {getSortIcon("status")}
                </th>
                <th
                  onClick={() => handleSort("created_at")}
                  style={{ cursor: "pointer" }}
                >
                  Дата {getSortIcon("created_at")}
                </th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    Скарг не знайдено
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr
                    key={c.complaint_id}
                    onClick={() => navigate(`/complaints/${c.complaint_id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{c.complaint_id}</td>
                    <td>{c.type_name}</td>
                    <td>{c.reporter_email}</td>
                    <td>{c.target_email}</td>
                    <td>
                      <span
                        className={`badge ${
                          c.status === "new"
                            ? "bg-warning text-dark"
                            : c.status === "closed"
                            ? "bg-secondary"
                            : "bg-primary"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ComplaintManagement;
