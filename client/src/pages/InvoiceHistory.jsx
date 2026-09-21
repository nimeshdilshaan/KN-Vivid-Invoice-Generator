import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import API from "../services/api";

const InvoiceHistory = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load invoices
  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/invoices");

      setInvoices(response.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load invoices"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // Delete invoice
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await API.delete(`/invoices/${id}`);

      setInvoices((prevInvoices) =>
        prevInvoices.filter(
          (invoice) => invoice.id !== id
        )
      );

      alert("Invoice deleted successfully!");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to delete invoice"
      );
    }
  };

  // Download invoice PDF
  const downloadPDF = async (invoice) => {
    const invoiceElement = document.getElementById(
      `invoice-${invoice.id}`
    );

    if (!invoiceElement) {
      alert("Invoice content not found.");
      return;
    }

    try {
      const canvas = await html2canvas(
        invoiceElement,
        {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff"
        }
      );

      const imageData =
        canvas.toDataURL("image/png");

      const pdf = new jsPDF(
        "p",
        "mm",
        "a4"
      );

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const imageWidth = pageWidth - 20;

      const imageHeight =
        (canvas.height * imageWidth) /
        canvas.width;

      let heightLeft = imageHeight;
      let position = 10;

      // First page
      pdf.addImage(
        imageData,
        "PNG",
        10,
        position,
        imageWidth,
        imageHeight
      );

      heightLeft -= pageHeight - 20;

      // Additional pages
      while (heightLeft > 0) {
        position =
          heightLeft - imageHeight + 10;

        pdf.addPage();

        pdf.addImage(
          imageData,
          "PNG",
          10,
          position,
          imageWidth,
          imageHeight
        );

        heightLeft -= pageHeight - 20;
      }

      // Example:
      // Invoice KN-000001.pdf
      pdf.save(
        `Invoice ${invoice.invoiceNumber}.pdf`
      );
    } catch (error) {
      console.error(error);

      alert("Failed to generate PDF");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-page">
        Loading invoices...
      </div>
    );
  }

  return (
    <div className="history-page">

      {/* Header */}
      <div className="history-header">

        <div>
          <h1>Invoice History</h1>

          <p>
            View and manage your saved invoices
          </p>
        </div>

        <div className="history-actions">

          <button
            className="secondary-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            className="primary-button"
            onClick={() =>
              navigate("/create-invoice")
            }
          >
            + Create Invoice
          </button>

        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Empty State */}
      {invoices.length === 0 ? (
        <div className="empty-state">

          <h2>No invoices yet</h2>

          <p>
            Create your first invoice to see it here.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              navigate("/create-invoice")
            }
          >
            Create Invoice
          </button>

        </div>
      ) : (

        /* Invoice List */
        <div className="invoice-list">

          {invoices.map((invoice) => (

            <div
              className="invoice-history-card"
              key={invoice.id}
            >

              {/* Invoice Information */}
              <div className="invoice-card-info">

                <h2>
                  {invoice.invoiceNumber}
                </h2>

                <p>
                  Customer:{" "}
                  <strong>
                    {invoice.customerName}
                  </strong>
                </p>

                <p>
                  Date:{" "}
                  {invoice.invoiceDate
                    ? new Date(
                        invoice.invoiceDate
                      ).toLocaleDateString()
                    : "-"}
                </p>

                <p>
                  Total:{" "}
                  <strong>
                    Rs.{" "}
                    {Number(
                      invoice.total || 0
                    ).toFixed(2)}
                  </strong>
                </p>

              </div>

              {/* Action Buttons */}
              <div className="invoice-card-actions">

                {/* EDIT BUTTON */}
                <button
                  className="secondary-button"
                  onClick={() =>
                    navigate(
                      `/edit-invoice/${invoice.id}`
                    )
                  }
                >
                  Edit
                </button>

                {/* DOWNLOAD PDF */}
                <button
                  className="secondary-button"
                  onClick={() =>
                    downloadPDF(invoice)
                  }
                >
                  Download PDF
                </button>

                {/* DELETE */}
                <button
                  className="delete-button"
                  onClick={() =>
                    handleDelete(invoice.id)
                  }
                >
                  Delete
                </button>

              </div>

              {/* Hidden PDF Invoice */}
              <div
                id={`invoice-${invoice.id}`}
                className="pdf-invoice"
              >

                {/* PDF Header */}
                <div className="pdf-header">

                  <div>
                    <h1>KN Vivid</h1>

                    <p>
                      Professional Invoice
                    </p>
                  </div>

                  <div className="pdf-invoice-number">

                    <h2>
                      {invoice.invoiceNumber}
                    </h2>

                    <p>
                      Date:{" "}
                      {invoice.invoiceDate
                        ? new Date(
                            invoice.invoiceDate
                          ).toLocaleDateString()
                        : "-"}
                    </p>

                  </div>

                </div>

                {/* Customer Details */}
                <div className="pdf-customer">

                  <h3>Bill To</h3>

                  <p>
                    {invoice.customerName}
                  </p>

                  {invoice.customerEmail && (
                    <p>
                      {invoice.customerEmail}
                    </p>
                  )}

                  {invoice.customerPhone && (
                    <p>
                      {invoice.customerPhone}
                    </p>
                  )}

                  {invoice.customerAddress && (
                    <p>
                      {invoice.customerAddress}
                    </p>
                  )}

                </div>

                {/* Items Table */}
                <table className="pdf-table">

                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>

                    {invoice.items &&
                      invoice.items.map(
                        (item, index) => (
                          <tr key={index}>

                            <td>
                              {item.description}
                            </td>

                            <td>
                              {item.quantity}
                            </td>

                            <td>
                              Rs.{" "}
                              {Number(
                                item.price || 0
                              ).toFixed(2)}
                            </td>

                            <td>
                              Rs.{" "}
                              {Number(
                                item.total || 0
                              ).toFixed(2)}
                            </td>

                          </tr>
                        )
                      )}

                  </tbody>

                </table>

                {/* Invoice Totals */}
                <div className="pdf-total-area">

                  <div>
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      Rs.{" "}
                      {Number(
                        invoice.subtotal || 0
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Discount
                    </span>

                    <strong>
                      Rs.{" "}
                      {Number(
                        invoice.discount || 0
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Tax
                    </span>

                    <strong>
                      Rs.{" "}
                      {Number(
                        invoice.tax || 0
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div className="pdf-grand-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      Rs.{" "}
                      {Number(
                        invoice.total || 0
                      ).toFixed(2)}
                    </strong>

                  </div>

                </div>

                {/* PDF Footer */}
                <div className="pdf-footer">
                  Thank you for your business.
                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
};

export default InvoiceHistory;