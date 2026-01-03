import React, { useState } from "react";
import api from "./api";
import { useNavigate, Link } from "react-router-dom";

function AddActionTypeForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    action_name: "",
    duration_days: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/types/action-types", formData);
      navigate("/types/action");
    } catch (err) {
      alert("Помилка створення");
    }
  };

  return (
    <div className="card mt-4">
      <div className="card-header">Додати Тип Дії</div>
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
              placeholder="Залиште пустим для перманентного"
              value={formData.duration_days}
              onChange={(e) =>
                setFormData({ ...formData, duration_days: e.target.value })
              }
            />
          </div>
          <button type="submit" className="btn btn-success">
            Зберегти
          </button>
          <Link to="/types/action" className="btn btn-secondary ms-2">
            Скасувати
          </Link>
        </form>
      </div>
    </div>
  );
}
export default AddActionTypeForm;
