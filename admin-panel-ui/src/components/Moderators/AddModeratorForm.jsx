import React, { useState } from "react";
import api from "../../api";
import { useNavigate, Link } from "react-router-dom";

function AddModeratorForm() {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const newModerator = {
      login: login,
      email: email,
      password: password,
      full_name: fullName,
    };

    try {
      await api.post("/moderators", newModerator);

      navigate("/moderators");
    } catch (err) {
      console.error("Error adding moderator:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(`Помилка: ${err.response.data.error}`);
      } else {
        setError("Не вдалося додати модератора.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mt-4 mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4>Додати нового модератора</h4>
        <Link to="/moderators" className="btn btn-sm btn-secondary">
          Назад до списку
        </Link>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="modLogin" className="form-label">
              Логін
            </label>
            <input
              type="text"
              className="form-control"
              id="modLogin"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="modEmail" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="modEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="modPassword" className="form-label">
              Пароль
            </label>
            <input
              type="password"
              className="form-control"
              id="modPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="modFullName" className="form-label">
              ПІБ
            </label>
            <input
              type="text"
              className="form-control"
              id="modFullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? "Додавання..." : "Зберегти"}
          </button>
          <Link to="/moderators" className="btn btn-light ms-2">
            Скасувати
          </Link>
        </form>
      </div>
    </div>
  );
}

export default AddModeratorForm;
