import React, { useState, useEffect } from "react";
import api from "../../api";
import { useParams, useNavigate, Link } from "react-router-dom";

function EditModeratorForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchModerator = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/moderators/${id}`);
        const mod = response.data;
        setLogin(mod.login);
        setEmail(mod.email);
        setFullName(mod.full_name);
      } catch (err) {
        console.error("Error fetching moderator data:", err);
        setError("Не вдалося завантажити дані модератора.");
      } finally {
        setLoading(false);
      }
    };
    fetchModerator();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const updatedModerator = {
      login: login,
      email: email,
      full_name: fullName,
    };

    try {
      await api.put(`/moderators/${id}`, updatedModerator);
      navigate("/moderators");
    } catch (err) {
      console.error("Error updating moderator:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(`Помилка: ${err.response.data.error}`);
      } else {
        setError("Не вдалося оновити модератора.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Завантаження даних для редагування...</p>;

  return (
    <div className="card mt-4 mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4>Оновити дані модератора (ID: {id})</h4>
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
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Оновлення..." : "Оновити"}
          </button>
          <Link to="/moderators" className="btn btn-light ms-2">
            Скасувати
          </Link>
        </form>
      </div>
    </div>
  );
}

export default EditModeratorForm;
