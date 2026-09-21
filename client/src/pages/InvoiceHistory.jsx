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

  const loadInvoices = async () => {
    try {
      setLoading(true);

      const response = await API.get("/invoices");

      setInvoices(response.data);
    } catch (error) {
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

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await API.delete(`/invoices/${id}`);

      setInvoices(
        invoices.filter((invoice) => invoice.id !== id)
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete invoice"
      );
    }
  };

  const downloadPDF = async (invoice) => {
    const invoiceElement =
      document.getElementById(
        `invoice-${invoice.id}`
      );

    if (!invoiceElement) {
      return;
    }

    try {
      const canvas = await html2canvas(
        invoiceElement,
        {
          scale: 2,
          useCORS: true
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

      pdf.addImage(
        imageData,
        "PNG",
        10,
        position,
        imageWidth,
        imageHeight
      );

      heightLeft -=
        pageHeight - 20;

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

        heightLeft -=
          pageHeight - 20;
      }

      pdf.save(
        `${invoice.invoiceNumber}.pdf`
      );
    } catch (error) {
      console.error(error);

      alert("Failed to generate PDF");
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        Loading invoices...
      </div>
    );
  }

  return (
    <div className="history-page">

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

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

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
        <div className="invoice-list">

          {invoices.map((invoice) => (
            <div
              className="invoice-history-card"
              key={invoice.id}
            >

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
                  {new Date(
                    invoice.invoiceDate
                  ).toLocaleDateString()}
                </p>

                <p>
                  Total:{" "}
                  <strong>
                    Rs.{" "}
                    {Number(
                      invoice.total
                    ).toFixed(2)}
                  </strong>
                </p>

              </div>

              <div className="invoice-card-actions">

                <button
                  className="secondary-button"
                  onClick={() =>
                    downloadPDF(invoice)
                  }
                >
                  Download PDF
                </button>

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
                      {new Date(
                        invoice.invoiceDate
                      ).toLocaleDateString()}
                    </p>

                  </div>

                </div>

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

                    {invoice.items.map(
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
                              item.price
                            ).toFixed(2)}
                          </td>

                          <td>
                            Rs.{" "}
                            {Number(
                              item.total
                            ).toFixed(2)}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

                <div className="pdf-total-area">

                  <div>
                    <span>Subtotal</span>
                    <strong>
                      Rs.{" "}
                      {Number(
                        invoice.subtotal
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>Discount</span>
                    <strong>
                      Rs.{" "}
                      {Number(
                        invoice.discount
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>Tax</span>
                    <strong>
                      Rs.{" "}
                      {Number(
                        invoice.tax
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div className="pdf-grand-total">
                    <span>Total</span>
                    <strong>
                      Rs.{" "}
                      {Number(
                        invoice.total
                      ).toFixed(2)}
                    </strong>
                  </div>

                </div>

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