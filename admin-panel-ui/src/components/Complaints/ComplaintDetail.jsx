import React, { useState, useEffect } from "react";
import api from "../../api";
import { useParams, useNavigate, Link } from "react-router-dom";

import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import SplitButton from "react-bootstrap/SplitButton";

function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null); // Зберігаємо весь об'єкт { complaint, actions }
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false); // Стан для керування відображенням Dropup

  // Завантаження даних
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get(`/manage/complaints/${id}`);
        setData(res.data); // Зберігаємо все, що надіслав сервер
      } catch (err) {
        alert("Помилка завантаження");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/manage/complaints/${id}/resolve`, {
        status: newStatus,
        moderator_comment: comment,
        moderator_id: 17,
      });
      // Опціонально: закрити дропдаун після успішної дії
      setShowDropdown(false);
      navigate("/complaints"); // Або можна перезавантажити дані: loadData()
    } catch (err) {
      alert("Помилка оновлення");
    }
  };

  if (loading) return <div className="text-center mt-5">Завантаження...</div>;
  if (!data) return <div className="text-center mt-5">Not Found</div>;

  const { complaint, actions } = data; // Деструктуризація

  return (
    <div className="container mt-4 pb-5">
      <Link to="/complaints" className="btn btn-outline-secondary mb-3">
        &larr; Назад до списку
      </Link>

      <div className="card mb-4">
        <div className="card-header bg-light">
          <h4>
            Скарга #{complaint.complaint_id}
            <span
              className={`mx-2 badge ${
                complaint.status === "new"
                  ? "bg-warning text-dark"
                  : complaint.status === "closed"
                  ? "bg-secondary"
                  : "bg-primary"
              }`}
            >
              {complaint.status}
            </span>
          </h4>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <h5>Від кого:</h5>
              <p>
                <Link to={`/users/${complaint.reporter_user_id}/manage`}>
                  {complaint.reporter_email}
                </Link>
              </p>
            </div>
            <div className="col-md-6">
              <h5>На кого:</h5>
              <p>
                <Link to={`/users/${complaint.target_user_id}/manage`}>
                  {complaint.target_email}
                </Link>
              </p>
            </div>
          </div>

          <div className="mb-3">
            <strong>Тип: </strong> {complaint.type_name}
          </div>

          <div className="mb-4 p-3 border rounded bg-light">
            <h6 className="text-muted">Текст скарги:</h6>
            <p className="mb-0">{complaint.description}</p>
          </div>

          {/* --- ІСТОРІЯ ДІЙ (КОМЕНТАРІ МОДЕРАТОРІВ) --- */}
          <h5 className="mb-3">Історія розгляду</h5>
          {actions.length === 0 ? (
            <p className="text-muted fst-italic">Історія порожня</p>
          ) : (
            <ul className="list-group mb-4">
              {actions.map((action) => (
                <li
                  key={action.moderator_action_id || action.action_id}
                  className="list-group-item"
                >
                  <div className="d-flex justify-content-between">
                    <strong>{action.moderator_name}</strong>
                    <small className="text-muted">
                      {new Date(action.action_at).toLocaleString()}
                    </small>
                  </div>
                  <div className="mt-1">
                    <span className="badge bg-info text-dark me-2">
                      {action.action_name}
                    </span>
                    <span>{action.reason_text}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <hr />

          <div className="mb-3">
            <label className="form-label">Ваш коментар / Причина:</label>
            <textarea
              className="form-control"
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Опишіть рішення..."
            ></textarea>
          </div>

          <SplitButton
            id="dropdown-button-drop-up"
            drop="up"
            variant="primary"
            title="Змінити статус"
            onClick={() => alert("Натиснута головна кнопка")}
          >
            <Dropdown.Item
              eventKey="1"
              onClick={() => handleStatusChange("in_progress")}
            >
              Взяти в роботу
            </Dropdown.Item>

            <Dropdown.Item
              eventKey="2"
              onClick={() => handleStatusChange("closed")}
            >
              Закрити (Вирішено)
            </Dropdown.Item>

            <Dropdown.Divider />

            <Dropdown.Item
              eventKey="3"
              onClick={() => handleStatusChange("new")}
            >
              Повернути в "Нові"
            </Dropdown.Item>
          </SplitButton>
        </div>
      </div>
    </div>
  );
}

export default ComplaintDetail;
