// src/components/AddComplaintForm.jsx
import React, { useState, useEffect } from "react";
import api from "../../api";
import { useNavigate, Link } from "react-router-dom";

function AddComplaintForm() {
  const navigate = useNavigate();

  // Стани для полів форми
  const [reporterUserId, setReporterUserId] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [moderatorId, setModeratorId] = useState("");
  const [complaintTypeId, setComplaintTypeId] = useState("");
  const [description, setDescription] = useState("");

  // Стани для випадаючих списків
  const [users, setUsers] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [complaintTypes, setComplaintTypes] = useState([]);

  // Стани для UI
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRefs, setLoadingRefs] = useState(true);

  // Завантаження довідників (Users, Moderators, ComplaintTypes)
  useEffect(() => {
    const fetchReferences = async () => {
      setLoadingRefs(true);
      try {
        const [usersRes, modsRes, typesRes] = await Promise.all([
          api.get("/manage/users/search"),
          api.get("/moderators"),
          api.get("/types/complaint-types"),
        ]);
        setUsers(usersRes.data);
        setModerators(modsRes.data);
        setComplaintTypes(typesRes.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching references:", err);
        setError("Не вдалося завантажити довідники для форми.");
      } finally {
        setLoadingRefs(false);
      }
    };
    fetchReferences();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const newComplaint = {
      reporter_user_id: parseInt(reporterUserId),
      target_user_id: parseInt(targetUserId),
      moderator_id: moderatorId ? parseInt(moderatorId) : null,
      complaint_type_id: parseInt(complaintTypeId),
      description: description,
    };

    try {
      await api.post("/manage/complaints/add", newComplaint);
      navigate("/complaints");
    } catch (err) {
      console.error("Error adding complaint:", err);
      setError(err.response?.data?.error || "Не вдалося додати скаргу.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingRefs) return <p>Завантаження даних форми...</p>;

  return (
    <div className="card mt-4 mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4>Додати нову скаргу</h4>
        <Link to="/complaints" className="btn btn-sm btn-secondary">
          Назад до списку скарг
        </Link>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="reporterUser" className="form-label">
              Скаржник *
            </label>
            <select
              id="reporterUser"
              className="form-select"
              value={reporterUserId}
              onChange={(e) => setReporterUserId(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">-- Виберіть користувача --</option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.login} (ID: {user.user_id})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="targetUser" className="form-label">
              Порушник *
            </label>
            <select
              id="targetUser"
              className="form-select"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">-- Виберіть користувача --</option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.login} (ID: {user.user_id})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="moderatorAssign" className="form-label">
              Призначити модератора (опціонально)
            </label>
            <select
              id="moderatorAssign"
              className="form-select"
              value={moderatorId}
              onChange={(e) => setModeratorId(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Не призначено --</option>
              {moderators.map((mod) => (
                <option key={mod.moderator_id} value={mod.moderator_id}>
                  {mod.full_name} (ID: {mod.moderator_id})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="complaintType" className="form-label">
              Тип скарги *
            </label>
            <select
              id="complaintType"
              className="form-select"
              value={complaintTypeId}
              onChange={(e) => setComplaintTypeId(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">-- Виберіть тип --</option>
              {complaintTypes.map((type) => (
                <option
                  key={type.complaint_type_id}
                  value={type.complaint_type_id}
                >
                  {type.type_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="compDescription" className="form-label">
              Опис (опціонально)
            </label>
            <textarea
              className="form-control"
              id="compDescription"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || loadingRefs}
          >
            {loading ? "Додавання..." : "Додати скаргу"}
          </button>
          <Link to="/complaints" className="btn btn-light ms-2">
            Скасувати
          </Link>
        </form>
      </div>
    </div>
  );
}

export default AddComplaintForm;
