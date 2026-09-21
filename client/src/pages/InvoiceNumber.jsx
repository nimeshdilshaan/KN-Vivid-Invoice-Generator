import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const InvoiceNumber = () => {
  const navigate = useNavigate();

  const [currentNumber, setCurrentNumber] =
    useState(800);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // Load current invoice number
  const loadCounter = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await API.get(
          "/invoices/counter"
        );

      setCurrentNumber(
        response.data.currentNumber
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load invoice number"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCounter();
  }, []);

  // Update number
  const updateNumber = async (
    newNumber
  ) => {
    if (newNumber < 1) {
      return;
    }

    const difference =
      newNumber - currentNumber;

    if (Math.abs(difference) > 5) {
      alert(
        "You can change the invoice number by maximum 5."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response =
        await API.put(
          "/invoices/counter",
          {
            number: newNumber
          }
        );

      setCurrentNumber(
        response.data.currentNumber
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to update invoice number"
      );
    } finally {
      setSaving(false);
    }
  };

  const increaseNumber = () => {
    updateNumber(
      currentNumber + 1
    );
  };

  const decreaseNumber = () => {
    if (currentNumber <= 1) {
      return;
    }

    updateNumber(
      currentNumber - 1
    );
  };

  const formattedNumber =
    `INVOICE-${String(
      currentNumber
    ).padStart(4, "0")}`;

  if (loading) {
    return (
      <div className="loading-page">
        Loading invoice number...
      </div>
    );
  }

  return (
    <div className="counter-page">

      <div className="counter-container">

        {/* Header */}
        <div className="counter-header">

          <div>
            <div className="dashboard-logo">
              KN Vivid
            </div>

            <h1>
              Invoice Number
            </h1>

            <p>
              Manage the current invoice number
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Counter Card */}
        <div className="counter-card">

          <p className="counter-label">
            Current Invoice Number
          </p>

          <h2 className="current-invoice-number">
            {formattedNumber}
          </h2>

          <div className="counter-controls">

            <button
              className="counter-button"
              onClick={decreaseNumber}
              disabled={
                saving ||
                currentNumber <= 1
              }
            >
              −
            </button>

            <div className="counter-value">
              {currentNumber}
            </div>

            <button
              className="counter-button"
              onClick={increaseNumber}
              disabled={saving}
            >
              +
            </button>

          </div>

          <p className="counter-help">
            You can change the invoice number
            by up to 5 numbers at a time.
          </p>

          <div className="counter-actions">

            <button
              className="secondary-button"
              onClick={() =>
                navigate("/invoices")
              }
            >
              Invoice History
            </button>

            <button
              className="primary-button"
              onClick={() =>
                navigate("/create-invoice")
              }
            >
              Create Invoice
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default InvoiceNumber;