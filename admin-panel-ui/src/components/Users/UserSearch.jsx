import React, { useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";

function UserSearch() {
  const navigate = useNavigate();

  const [viewState, setViewState] = useState("forms");
  const [basicSearch, setBasicSearch] = useState({ id: "", email: "" });
  const [advSearch, setAdvSearch] = useState({
    name: "",
    city: "",
    country: "",
    age: "",
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    sortBy: "created_at",
    sortOrder: "DESC",
  });
  const [activeFilters, setActiveFilters] = useState({});

  const executeSearch = async (filters, sort = sortConfig) => {
    setLoading(true);
    setError(null);

    const params = { ...filters, ...sort };

    try {
      const response = await api.get("/manage/users/search", { params });
      setUsers(response.data);
      setViewState("results");
      setActiveFilters(filters);
    } catch (err) {
      console.error(err);
      setError("Помилка при пошуку. Перевірте дані.");
    } finally {
      setLoading(false);
    }
  };

  const handleBasicSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (basicSearch.id) params.id = basicSearch.id;
    else if (basicSearch.email) params.email = basicSearch.email;
    else {
      alert("Введіть ID або Email");
      return;
    }

    const defaultSort = { sortBy: "created_at", sortOrder: "DESC" };
    setSortConfig(defaultSort);
    executeSearch(params, defaultSort);
  };

  const handleAdvSubmit = (e) => {
    e.preventDefault();
    const params = Object.fromEntries(
      Object.entries(advSearch).filter(([_, v]) => v !== "")
    );

    const defaultSort = { sortBy: "created_at", sortOrder: "DESC" };
    setSortConfig(defaultSort);
    executeSearch(params, defaultSort);
  };

  const handleSort = (column) => {
    const newOrder =
      sortConfig.sortBy === column && sortConfig.sortOrder === "ASC"
        ? "DESC"
        : "ASC";
    const newSort = { sortBy: column, sortOrder: newOrder };
    setSortConfig(newSort);
    executeSearch(activeFilters, newSort);
  };

  const getSortIcon = (column) => {
    if (sortConfig.sortBy !== column)
      return <span className="text-muted ms-1">⇅</span>;
    return sortConfig.sortOrder === "ASC" ? " ▲" : " ▼";
  };

  const handleStatusFilter = (e) => {
    const newStatus = e.target.value;
    const newFilters = { ...activeFilters, status: newStatus };
    executeSearch(newFilters, sortConfig);
  };

  const resetSearch = () => {
    setUsers([]);
    setViewState("forms");
    setBasicSearch({ id: "", email: "" });
    setAdvSearch({ name: "", city: "", country: "", age: "" });
    setActiveFilters({});
    setError(null);
  };

  return (
    <div className="mt-4">
      {/* ФОРМЫ ПОИСКА */}
      {viewState === "forms" && (
        <div className="row">
          <div className="col-md-5">
            <div className="card h-100 border-primary">
              <div className="card-header bg-primary text-white">
                Базовий пошук
              </div>
              <div className="card-body">
                <form onSubmit={handleBasicSubmit}>
                  <div className="mb-3">
                    <label className="form-label">ID / Email</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ID або Email"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!isNaN(val) && val !== "")
                          setBasicSearch({ id: val, email: "" });
                        else setBasicSearch({ id: "", email: val });
                      }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Знайти
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-7">
            <div className="card h-100 border-info">
              <div className="card-header bg-info text-white">
                Розширений пошук
              </div>
              <div className="card-body">
                <form onSubmit={handleAdvSubmit}>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label">Ім'я / Логін</label>
                      <input
                        type="text"
                        className="form-control"
                        value={advSearch.name}
                        onChange={(e) =>
                          setAdvSearch({ ...advSearch, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Місто</label>
                      <input
                        type="text"
                        className="form-control"
                        value={advSearch.city}
                        onChange={(e) =>
                          setAdvSearch({ ...advSearch, city: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Країна</label>
                      <input
                        type="text"
                        className="form-control"
                        value={advSearch.country}
                        onChange={(e) =>
                          setAdvSearch({
                            ...advSearch,
                            country: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Вік</label>
                      <input
                        type="number"
                        className="form-control"
                        value={advSearch.age}
                        onChange={(e) =>
                          setAdvSearch({ ...advSearch, age: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-info w-100 mt-3 text-white"
                  >
                    Шукати
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* РЕЗУЛЬТАТЫ */}
      {viewState === "results" && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
            <h3 className="mb-0">Результати ({users.length})</h3>

            <div className="d-flex gap-3 align-items-center">
              <div className="d-flex align-items-center">
                <label className="me-2 fw-bold">Статус:</label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "150px" }}
                  value={activeFilters.status || ""}
                  onChange={handleStatusFilter}
                >
                  <option value="">Всі</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>

              <button className="btn btn-secondary" onClick={resetSearch}>
                &larr; Новий пошук
              </button>
            </div>
          </div>

          <div className="card-body p-0">
            {loading && <div className="text-center my-4">Завантаження...</div>}

            {!loading && users.length === 0 ? (
              <div className="text-center my-4 text-muted">
                Користувачів не знайдено.
              </div>
            ) : (
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr style={{ cursor: "pointer" }}>
                    <th
                      onClick={() => handleSort("user_id")}
                      style={{ cursor: "pointer" }}
                    >
                      ID {getSortIcon("user_id")}
                    </th>
                    <th
                      onClick={() => handleSort("login")}
                      style={{ cursor: "pointer" }}
                    >
                      Логін {getSortIcon("login")}
                    </th>
                    <th
                      onClick={() => handleSort("first_name")}
                      style={{ cursor: "pointer" }}
                    >
                      Ім'я {getSortIcon("first_name")}
                    </th>
                    <th>Локація</th>
                    <th
                      onClick={() => handleSort("account_status")}
                      style={{ cursor: "pointer" }}
                    >
                      Статус {getSortIcon("account_status")}
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
                  {users.map((u) => (
                    <tr
                      key={u.user_id}
                      onClick={() => navigate(`/users/${u.user_id}/manage`)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{u.user_id}</td>
                      <td>
                        <div className="fw-bold">{u.login}</div>
                        <small className="text-muted">{u.email}</small>
                      </td>
                      <td>{u.first_name || "-"}</td>
                      <td>
                        {u.city ? u.city : ""}
                        {u.city && u.country ? ", " : ""}
                        {u.country ? u.country : ""}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            u.account_status === "active"
                              ? "bg-success"
                              : u.account_status === "deleted"
                              ? "bg-secondary"
                              : "bg-danger"
                          }`}
                        >
                          {u.account_status}
                        </span>
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
}

export default UserSearch;
