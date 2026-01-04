import React, { useState, useEffect } from "react";
import api from "../../api";
import { useNavigate, Link, useParams } from "react-router-dom";

function EditComplaintTypeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ type_name: "", description: "" });

  useEffect(() => {
    api
      .get(`/types/complaint-types/${id}`)
      .then((res) =>
        setFormData({
          type_name: res.data.type_name,
          description: res.data.description || "",
        })
      )
      .catch((err) => alert("Помилка завантаження"));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/types/complaint-types/${id}`, formData);
      navigate("/types/complaint");
    } catch (err) {
      alert("Помилка оновлення");
    }
  };

  return (
    <div className="card mt-4">
      <div className="card-header">Редагувати Тип Скарги (ID: {id})</div>
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
          <button type="submit" className="btn btn-primary">
            Оновити
          </button>
          <Link to="/types/complaint" className="btn btn-secondary ms-2">
            Скасувати
          </Link>
        </form>
      </div>
    </div>
  );
}
export default EditComplaintTypeForm;
