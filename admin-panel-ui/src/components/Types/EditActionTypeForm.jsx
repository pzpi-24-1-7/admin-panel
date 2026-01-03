import React, { useState, useEffect } from "react";
import api from "./api"
import { useNavigate, Link, useParams } from "react-router-dom";

function EditActionTypeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    action_name: "",
    duration_days: "",
  });

  useEffect(() => {
    api
      .get(`/types/action-types/${id}`)
      .then((res) =>
        setFormData({
          action_name: res.data.action_name,
          duration_days:
            res.data.duration_days !== null ? res.data.duration_days : "",
        })
      )
      .catch((err) => alert("Помилка завантаження"));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(
        `/types/action-types/${id}`,
        formData
      );
      navigate("/types/action");
    } catch (err) {
      alert("Помилка оновлення");
    }
  };

  return (
    <div className="card mt-4">
      <div className="card-header">Редагувати Тип Дії (ID: {id})</div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Назва</label>
            <input
              className="form-control"
              value={formData.action_name}
              onChange={(e) =>
                setFormData({ ...formData, action_name: e.target.value })
              }
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Тривалість (дні)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Пусто = перманентно"
              value={formData.duration_days}
              onChange={(e) =>
                setFormData({ ...formData, duration_days: e.target.value })
              }
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Оновити
          </button>
          <Link to="/types/action" className="btn btn-secondary ms-2">
            Скасувати
          </Link>
        </form>
      </div>
    </div>
  );
}
export default EditActionTypeForm;
