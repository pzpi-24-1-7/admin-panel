import React, { useState } from "react";
import api from "../../api";
import { useNavigate, Link } from "react-router-dom";

function AddComplaintTypeForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ type_name: "", description: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/types/complaint-types", formData);
      navigate("/types/complaint");
    } catch (err) {
      alert("Помилка створення");
    }
  };

  return (
    <div className="card mt-4">
      <div className="card-header">Додати Тип Скарги</div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Назва</label>
            <input
              className="form-control"
              value={formData.type_name}
              onChange={(e) =>
                setFormData({ ...formData, type_name: e.target.value })
              }
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Опис</label>
            <input
              className="form-control"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <button type="submit" className="btn btn-success">
            Зберегти
          </button>
          <Link to="/types/complaint" className="btn btn-secondary ms-2">
            Скасувати
          </Link>
        </form>
      </div>
    </div>
  );
}
export default AddComplaintTypeForm;
