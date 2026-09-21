import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <div className="dashboard-logo">
            KN Vivid
          </div>

          <h1>Invoice Generator</h1>

          <p>
            Welcome, {user.name || "User"}
          </p>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <div
          className="dashboard-card"
          onClick={() => navigate("/create-invoice")}
        >
          <h2>Create Invoice</h2>

          <p>
            Create a new professional invoice.
          </p>

          <button className="primary-button">
            Create Invoice
          </button>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/invoices")}
        >
          <h2>Invoice History</h2>

          <p>
            View and manage your previous invoices.
          </p>

          <button className="secondary-button">
            View Invoices
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;