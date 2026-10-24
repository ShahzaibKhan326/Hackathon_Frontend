
import "./App.css";

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>HCM Lite</h2>

        <nav>
          <a href="#dashboard">Dashboard</a>
          <a href="#employees">Employees</a>
          <a href="#attendance">Attendance</a>
          <a href="#leaves">Leave Management</a>
          <a href="#payroll">Payroll</a>
        </nav>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Human Capital Management System</p>
          </div>

          <span className="admin-badge">Admin</span>
        </header>

        <section className="welcome">
          <h2>Welcome to HCM Lite 👋</h2>
          <p>Manage your workforce from one place.</p>
        </section>

        <section className="stats">
          <div className="stat-card">
            <p>Total Employees</p>
            <h2>0</h2>
          </div>

          <div className="stat-card">
            <p>Present Today</p>
            <h2>0</h2>
          </div>

          <div className="stat-card">
            <p>Pending Leaves</p>
            <h2>0</h2>
          </div>

          <div className="stat-card">
            <p>Payroll Records</p>
            <h2>0</h2>
          </div>
        </section>

        <section className="activity">
          <h2>Getting Started</h2>
          <p>Your HR management dashboard is ready for setup.</p>
        </section>
      </main>
    </div>
  );
}

export default App;
