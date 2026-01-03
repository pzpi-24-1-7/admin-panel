import React, { useState, useEffect } from "react";
import api from "./api";
import { Link } from "react-router-dom";

function ComplaintTypeList() {
  const [types, setTypes] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    api
      .get("/types/complaint-types")
      .then((res) => setTypes(res.data))
      .catch((err) => console.error(err));
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm("Видалити цей тип скарги?")) return;
    try {
      await api.delete(`/types/complaint-types/${id}`);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      alert(err.response?.data?.error || "Помилка видалення");
    }
  };

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Довідник: Типи Скарг</h3>
        <Link to="/types/complaint/add" className="btn btn-success">
          Додати тип
        </Link>
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Назва</th>
            <th>Опис</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {types.map((t) => (
            <tr key={t.complaint_type_id}>
              <td>{t.complaint_type_id}</td>
              <td>{t.type_name}</td>
              <td>{t.description}</td>
              <td>
                <Link
                  to={`/types/complaint/edit/${t.complaint_type_id}`}
                  className="btn btn-sm btn-primary me-2"
                >
                  Ред.
                </Link>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(t.complaint_type_id)}
                >
                  Вид.
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default ComplaintTypeList;
