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

      {/* Header */}
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

      {/* Dashboard Cards */}
      <main className="dashboard-content">

        {/* Create Invoice */}
        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/create-invoice")
          }
        >
          <h2>Create Invoice</h2>

          <p>
            Create a new professional invoice.
          </p>

          <button
            className="primary-button"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/create-invoice");
            }}
          >
            Create Invoice
          </button>
        </div>

        {/* Invoice History */}
        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/invoices")
          }
        >
          <h2>Invoice History</h2>

          <p>
            View and manage your previous invoices.
          </p>

          <button
            className="secondary-button"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/invoices");
            }}
          >
            View Invoices
          </button>
        </div>

        {/* Invoice Number */}
        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/invoice-number")
          }
        >
          <h2>Invoice Number</h2>

          <p>
            View and manage the current invoice number.
          </p>

          <button
            className="secondary-button"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/invoice-number");
            }}
          >
            Manage Number
          </button>
        </div>

      </main>

    </div>
  );
};

export default Dashboard;