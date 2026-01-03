import React, { useState } from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";

import ModeratorList from "./components/Moderators/ModeratorList";
import AddModeratorForm from "./components/Moderators/AddModeratorForm";
import EditModeratorForm from "./components/Moderators/EditModeratorForm";
import ModeratorActionList from "./components/Moderators/ModeratorActionList";
import ActionList from "./components/Moderators/ActionList";

import AddComplaintForm from "./components/Complaints/AddComplaintForm";
import ComplaintManagement from "./components/Complaints/ComplaintManagement";
import ComplaintDetail from "./components/Complaints/ComplaintDetail";

import UserSearch from "./components/Users/UserSearch";
import UserProfileManager from "./components/Users/UserProfileManager";

import StatsComplaintType from "./components/Stats/StatsComplaintType";
import StatsModActions from "./components/Stats/StatsModActions";
import StatsTopViolators from "./components/Stats/StatsViolationTrends";
import StatsModeratorKPI from "./components/Stats/StatsModeratorPerformance";

import ComplaintTypeList from "./components/Types/ComplaintTypeList";
import AddComplaintTypeForm from "./components/Types/AddComplaintTypeForm";
import EditComplaintTypeForm from "./components/Types/EditComplaintTypeForm";

import ActionTypeList from "./components/Types/ActionTypeList";
import AddActionTypeForm from "./components/Types/AddActionTypeForm";
import EditActionTypeForm from "./components/Types/EditActionTypeForm";

import "./App.css";

function Dashboard() {
  const [dossierUserId, setDossierUserId] = useState("");

  return (
    <div className="mt-4">
      <div className="p-5 bg-light rounded mb-4 shadow-sm">
        <h1 className="display-6 fw-bold">Панель керування</h1>
        <p className="fs-5">Система модерації та аналітики.</p>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card h-100 border-primary">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">📊 Статистики</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link
                  to="/stats/violation-trends"
                  className="btn btn-outline-primary text-start"
                >
                  🔥 Тренди порушень
                </Link>
                <Link
                  to="/stats/moderator-performance"
                  className="btn btn-outline-success text-start"
                >
                  ⭐ Ефективність модераторів
                </Link>
                <Link
                  to="/stats/moderator-actions"
                  className="btn btn-outline-secondary text-start"
                >
                  📅 Дії за період
                </Link>
                <Link
                  to="/stats/complaints-by-type"
                  className="btn btn-outline-secondary text-start"
                >
                  📅 Скарги за статусом
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100 border-dark">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">🖨️ Звіти (PDF)</h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h6>1. Звіт активності (Місяць)</h6>
                <a
                  href="http://localhost:3001/api/reports/monthly-activity"
                  target="_blank"
                  className="btn btn-dark w-100"
                >
                  📄 Завантажити звіт
                </a>
              </div>
              <hr />
              <div>
                <h6>2. Досьє на користувача</h6>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="ID користувача"
                    value={dossierUserId}
                    onChange={(e) => setDossierUserId(e.target.value)}
                  />
                  {dossierUserId ? (
                    <a
                      href={`http://localhost:3001/api/reports/user-dossier/${dossierUserId}`}
                      target="_blank"
                      className="btn btn-secondary"
                    >
                      Завантажити
                    </a>
                  ) : (
                    <button className="btn btn-secondary" disabled>
                      Введіть ID
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="app-wrapper">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 rounded-0">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">
            Адмін-панель
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="admin-navbar-nav" />
          <Navbar.Collapse id="admin-navbar-nav">
            <Nav className="me-auto mb-2 mb-lg-0">
              <Nav.Link as={NavLink} to="/complaints">
                Скарги
              </Nav.Link>
              <Nav.Link as={NavLink} to="/users">
                Користувачі
              </Nav.Link>
              <Nav.Link as={NavLink} to="/actions">
                Усі дії
              </Nav.Link>
              <Nav.Link as={NavLink} to="/moderators">
                Модератори
              </Nav.Link>
              <NavDropdown
                title="Довідники"
                id="dictionaries-nav-dropdown"
                menuVariant="dark"
              >
                <NavDropdown.Item as={Link} to="/types/complaint">
                  Типи Скарг
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/types/action">
                  Типи Дій
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <main className="container-xl mx-auto p-3">
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/moderators" element={<ModeratorList />} />
          <Route path="/moderators/add" element={<AddModeratorForm />} />
          <Route
            path="/moderators/:id/actions"
            element={<ModeratorActionList />}
          />
          <Route path="/moderators/edit/:id" element={<EditModeratorForm />} />

          <Route path="/actions" element={<ActionList />} />

          <Route path="/users" element={<UserSearch />} />
          <Route path="/users/:id/manage" element={<UserProfileManager />} />

          <Route path="/complaints" element={<ComplaintManagement />} />
          <Route path="/complaints/add" element={<AddComplaintForm />} />
          <Route path="/complaints/:id" element={<ComplaintDetail />} />

          <Route path="/types/complaint" element={<ComplaintTypeList />} />
          <Route
            path="/types/complaint/add"
            element={<AddComplaintTypeForm />}
          />
          <Route
            path="/types/complaint/edit/:id"
            element={<EditComplaintTypeForm />}
          />

          <Route path="/types/action" element={<ActionTypeList />} />
          <Route path="/types/action/add" element={<AddActionTypeForm />} />
          <Route
            path="/types/action/edit/:id"
            element={<EditActionTypeForm />}
          />

          <Route
            path="/stats/complaints-by-type"
            element={<StatsComplaintType />}
          />
          <Route
            path="/stats/moderator-actions"
            element={<StatsModActions />}
          />
          <Route
            path="/stats/violation-trends"
            element={<StatsTopViolators />}
          />
          <Route
            path="/stats/moderator-performance"
            element={<StatsModeratorKPI />}
          />

          <Route
            path="*"
            element={
              <div className="text-center mt-5">
                <h2>404 - Сторінку не знайдено</h2>
                <Link to="/">На головну</Link>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
