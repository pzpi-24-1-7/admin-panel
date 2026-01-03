// src/components/EditModeratorForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

function EditModeratorForm() {
  const { id } = useParams(); // Отримуємо ID модератора з URL
  const navigate = useNavigate(); // Для перенаправлення

  // Стани для полів форми
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  // Стани для UI
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Завантаження даних для форми
  const [saving, setSaving] = useState(false); // Збереження (оновлення)

  // 1. Завантажуємо поточні дані модератора
  useEffect(() => {
    const fetchModerator = async () => {
      setLoading(true);
      try {
        // Використовуємо GET /api/moderators/:id
        const response = await axios.get(
          `http://localhost:3001/api/moderators/${id}`
        );
        const mod = response.data;
        // Заповнюємо стани даними з API
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
  }, [id]); // Ефект залежить від ID з URL

  // 2. Функція відправки оновлених даних
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
      // Використовуємо метод PUT
      await axios.put(
        `http://localhost:3001/api/moderators/${id}`,
        updatedModerator
      );

      // Успіх! Перенаправляємо на головний список
      navigate("/moderators");
    } catch (err) {
      console.error("Error updating moderator:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(`Помилка: ${err.response.data.error}`); // Наприклад, дублікат email/login
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
        {/* Помилка завантаження або збереження */}
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
