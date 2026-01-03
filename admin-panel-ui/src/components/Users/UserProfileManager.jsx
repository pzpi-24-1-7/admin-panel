import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import UserChatViewer from "./UserChatViewer";

function UserProfileManager() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  const [selectedFile, setSelectedFile] = useState(null);
  const [newComment, setNewComment] = useState("");

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3001/api/manage/users/${id}/details`
      );
      setData(res.data);

      setFormData({
        email: res.data.user.email,
        first_name: res.data.user.first_name || "",
        city: res.data.user.city || "",
        country: res.data.user.country || "",
        gender: res.data.user.gender || "",
        birth_date: res.data.user.birth_date
          ? res.data.user.birth_date.split("T")[0]
          : "",
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Помилка завантаження профілю");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const saveGeneral = async () => {
    try {
      await axios.put(
        `http://localhost:3001/api/manage/users/${id}/general`,
        formData
      );
      setEditMode(false);
      fetchData();
    } catch (err) {
      alert("Помилка збереження даних");
    }
  };

  const toggleUserBan = async () => {
    const newStatus =
      data.user.account_status === "active" ? "blocked" : "active";

    if (!window.confirm(`Ви впевнені? Новий статус: ${newStatus}`)) return;

    try {
      await axios.put(`http://localhost:3001/api/manage/users/${id}/status`, {
        status: newStatus,
      });
      fetchData();
    } catch (err) {
      alert("Помилка зміни статусу");
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm("УВАГА! Це незворотна дія. Продовжити?")) return;

    try {
      await axios.put(`http://localhost:3001/api/manage/users/${id}/delete`);
      alert("Користувача успішно видалено.");
      fetchData();
    } catch (err) {
      alert("Помилка видалення");
    }
  };

  const moderateBio = async (action) => {
    try {
      await axios.put(`http://localhost:3001/api/manage/users/${id}/bio`, {
        action, // 'ban', 'unban', 'delete'
      });
      fetchData();
    } catch (err) {
      alert("Помилка модерації біографії");
    }
  };

  const moderatePhoto = async (photoId, action) => {
    try {
      await axios.put(
        `http://localhost:3001/api/manage/users/photos/${photoId}`,
        { action }
      );
      fetchData();
    } catch (err) {
      alert("Помилка модерації фото");
    }
  };

  const addPhoto = async () => {
    if (!selectedFile) {
      alert("Будь ласка, виберіть файл!");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      await axios.post(
        `http://localhost:3001/api/manage/users/${id}/photos`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setSelectedFile(null);
      document.getElementById("fileInput").value = "";

      fetchData();
    } catch (err) {
      alert("Помилка завантаження фото");
    }
  };

  const addComment = async () => {
    if (!newComment) return;
    try {
      await axios.post(
        `http://localhost:3001/api/manage/users/${id}/comments`,
        {
          moderator_id: 1,
          comment_text: newComment,
        }
      );
      setNewComment("");
      fetchData();
    } catch (err) {
      alert("Помилка додавання коментаря");
    }
  };

  if (loading) return <div className="text-center mt-5">Завантаження...</div>;
  if (!data)
    return <div className="text-center mt-5">Користувача не знайдено</div>;

  const u = data.user;
  const isDeleted = u.account_status === "deleted";

  return (
    <div className="container mt-4 pb-5">
      <Link to="/users" className="btn btn-outline-secondary mb-3">
        &larr; Назад до пошуку
      </Link>

      <div
        className={`card mb-4 border-top-0 border-end-0 border-bottom-0 border-5 
                ${u.account_status === "blocked" ? "border-danger" : ""}
                ${u.account_status === "active" ? "border-success" : ""}
                ${isDeleted ? "border-secondary bg-light" : ""} 
            `}
      >
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3>
            {isDeleted ? <s>{u.login}</s> : u.login}
            <small className="text-muted fs-6 ms-2">(ID: {u.user_id})</small>
          </h3>
          <div>
            <span
              className={`badge me-3 
                            ${u.account_status === "active" ? "bg-success" : ""}
                            ${u.account_status === "blocked" ? "bg-danger" : ""}
                            ${isDeleted ? "bg-secondary" : ""}
                        `}
            >
              {u.account_status.toUpperCase()}
            </span>

            {!isDeleted && (
              <>
                <button
                  className={`btn me-2 ${
                    u.account_status === "active"
                      ? "btn-warning"
                      : "btn-success"
                  }`}
                  onClick={toggleUserBan}
                >
                  {u.account_status === "active"
                    ? "Заблокувати"
                    : "Розблокувати"}
                </button>
                <button className="btn btn-danger" onClick={handleDeleteUser}>
                  Софт-видалити
                </button>
              </>
            )}
          </div>
        </div>
        <div className="card-body">
          {editMode && !isDeleted ? (
            // РЕЖИМ РЕДАГУВАННЯ
            <div className="row g-3">
              <div className="col-md-6">
                <label>Email</label>
                <input
                  className="form-control"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="col-md-6">
                <label>Ім'я</label>
                <input
                  className="form-control"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                />
              </div>
              <div className="col-md-6">
                <label>Місто</label>
                <input
                  className="form-control"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
              <div className="col-md-6">
                <label>Країна</label>
                <input
                  className="form-control"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                />
              </div>
              <div className="col-md-6">
                <label>Дата народження</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.birth_date}
                  onChange={(e) =>
                    setFormData({ ...formData, birth_date: e.target.value })
                  }
                />
              </div>
              <div className="col-md-6">
                <label>Стать</label>
                <select
                  className="form-select"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                >
                  <option value="Чоловік">Чоловік</option>
                  <option value="Жінка">Жінка</option>
                </select>
              </div>
              <div className="col-12 mt-3">
                <button className="btn btn-success me-2" onClick={saveGeneral}>
                  Зберегти
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditMode(false)}
                >
                  Скасувати
                </button>
              </div>
            </div>
          ) : (
            // РЕЖИМ ПЕРЕГЛЯДУ
            <div className="row">
              <div className="col-md-3 mb-2">
                <strong>Email:</strong>
                <br /> {u.email}
              </div>
              <div className="col-md-3 mb-2">
                <strong>Ім'я:</strong>
                <br /> {u.first_name || "-"}
              </div>
              <div className="col-md-3 mb-2">
                <strong>Місто:</strong>
                <br /> {u.city || "-"}
              </div>
              <div className="col-md-3 mb-2">
                <strong>Країна:</strong>
                <br /> {u.country || "-"}
              </div>
              <div className="col-md-3 mb-2">
                <strong>Стать:</strong>
                <br /> {u.gender || "-"}
              </div>
              <div className="col-md-3 mb-2">
                <strong>Вік / Д.Н.:</strong>
                <br />
                {u.age
                  ? `${u.age} років`
                  : u.birth_date
                  ? new Date(u.birth_date).toLocaleDateString()
                  : "-"}
              </div>

              <div className="col-md-3 mb-2">
                <strong>Зареєстрований:</strong>
                <br /> {new Date(u.created_at).toLocaleDateString()}
              </div>
              <div className="col-md-3 mb-2">
                <strong>Останній вхід:</strong>
                <br />{" "}
                {u.last_login
                  ? new Date(u.last_login).toLocaleString()
                  : "Ніколи"}
              </div>

              {!isDeleted && (
                <div className="col-12 mt-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setEditMode(true)}
                  >
                    Редагувати дані
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!isDeleted && (
        <>
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Опис профілю (Bio)</span>
              <span
                className={`badge ${
                  u.bio_status === "banned" ? "bg-danger" : "bg-success"
                }`}
              >
                Статус: {u.bio_status}
              </span>
            </div>
            <div className="card-body">
              <div className="p-3 bg-light border rounded mb-3 fst-italic">
                {u.bio_text || "Користувач не додав опис."}
              </div>
              <div className="btn-group">
                <button
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => moderateBio("ban")}
                >
                  Забанити текст
                </button>
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() => moderateBio("unban")}
                >
                  Схвалити текст
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => moderateBio("delete")}
                >
                  Видалити текст
                </button>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header">Фотографії користувача</div>
            <div className="card-body">
              <div className="row mb-4">
                {data.photos.length === 0 && (
                  <div className="col-12 text-muted">Фото відсутні</div>
                )}
                {data.photos.map((photo) => (
                  <div key={photo.photo_id} className="col-md-3 col-sm-6 mb-4">
                    <div
                      className={`card h-100 ${
                        photo.moderation_status === "banned"
                          ? "border-danger bg-danger bg-opacity-10"
                          : ""
                      }`}
                    >
                      <div
                        style={{
                          height: "150px",
                          background: "#eee",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {photo.photo_url.startsWith("http") ? (
                          <img
                            src={photo.photo_url}
                            alt="User"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span className="text-muted">{photo.photo_url}</span>
                        )}
                      </div>
                      <div className="card-body p-2 text-center">
                        <small className="d-block mb-2">
                          Статус: <strong>{photo.moderation_status}</strong>
                        </small>
                        <div className="btn-group btn-group-sm w-100">
                          <button
                            className="btn btn-outline-warning"
                            onClick={() => moderatePhoto(photo.photo_id, "ban")}
                          >
                            Бан
                          </button>
                          <button
                            className="btn btn-outline-success"
                            onClick={() =>
                              moderatePhoto(photo.photo_id, "unban")
                            }
                          >
                            Ок
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() =>
                              moderatePhoto(photo.photo_id, "delete")
                            }
                          >
                            Del
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 p-3 bg-light border rounded">
                <label className="form-label fw-bold">
                  Завантажити нове фото:
                </label>
                <div className="input-group">
                  <input
                    type="file"
                    className="form-control"
                    id="fileInput"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={addPhoto}
                    disabled={!selectedFile}
                  >
                    Завантажити
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <UserChatViewer userId={u.user_id} />
      <div className="card">
        <div className="card-header bg-secondary text-white">
          Внутрішні коментарі (Тільки для персоналу)
        </div>
        <div className="card-body">
          <div
            className="mb-3"
            style={{ maxHeight: "300px", overflowY: "auto" }}
          >
            {data.comments.length === 0 && (
              <p className="text-muted">Коментарів немає.</p>
            )}
            <ul className="list-group list-group-flush">
              {data.comments.map((c) => (
                <li key={c.comment_id} className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <strong>{c.moderator_login}</strong>
                    <small className="text-muted">
                      {new Date(c.created_at).toLocaleString()}
                    </small>
                  </div>
                  <p className="mb-0 mt-1">{c.comment_text}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Напишіть замітку..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button className="btn btn-secondary" onClick={addComment}>
              Додати
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfileManager;
