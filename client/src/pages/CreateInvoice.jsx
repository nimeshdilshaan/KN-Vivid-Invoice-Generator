import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const CreateInvoice = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    invoiceDate: new Date()
      .toISOString()
      .split("T")[0],
    discount: 0,
    tax: 0
  });

  const [items, setItems] = useState([
    {
      description: "",
      quantity: 1,
      price: 0
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFormChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleItemChange = (index, e) => {
    const updatedItems = [...items];

    updatedItems[index][e.target.name] =
      e.target.value;

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        price: 0
      }
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;

    setItems(
      items.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) *
        Number(item.price || 0),
    0
  );

  const discount = Number(form.discount) || 0;
  const tax = Number(form.tax) || 0;

  const total = subtotal - discount + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.customerName.trim()) {
      setError("Customer name is required");
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.description.trim() &&
        Number(item.quantity) > 0 &&
        Number(item.price) >= 0
    );

    if (validItems.length === 0) {
      setError(
        "Please add at least one valid invoice item"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/invoices", {
        ...form,
        items: validItems
      });

      alert(
        `Invoice ${response.data.invoiceNumber} created successfully!`
      );

      navigate("/invoices");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invoice-page">

      <div className="invoice-header">
        <div>
          <h1>Create Invoice</h1>
          <p>Create a new professional invoice</p>
        </div>

        <button
          className="secondary-button"
          onClick={() => navigate("/dashboard")}
        >
          Back
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form
        className="invoice-form"
        onSubmit={handleSubmit}
      >

        <section className="invoice-section">
          <h2>Customer Information</h2>

          <div className="form-grid">

            <div className="form-group">
              <label>Customer Name *</label>

              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleFormChange}
                placeholder="Customer name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="customerEmail"
                value={form.customerEmail}
                onChange={handleFormChange}
                placeholder="customer@email.com"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>

              <input
                type="text"
                name="customerPhone"
                value={form.customerPhone}
                onChange={handleFormChange}
                placeholder="07X XXXXXXX"
              />
            </div>

            <div className="form-group">
              <label>Invoice Date</label>

              <input
                type="date"
                name="invoiceDate"
                value={form.invoiceDate}
                onChange={handleFormChange}
              />
            </div>

          </div>

          <div className="form-group">
            <label>Customer Address</label>

            <textarea
              name="customerAddress"
              value={form.customerAddress}
              onChange={handleFormChange}
              placeholder="Customer address"
              rows="3"
            />
          </div>
        </section>

        <section className="invoice-section">
          <div className="section-title-row">
            <h2>Invoice Items</h2>

            <button
              type="button"
              className="secondary-button"
              onClick={addItem}
            >
              + Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div
              className="item-row"
              key={index}
            >

              <input
                type="text"
                name="description"
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  handleItemChange(index, e)
                }
              />

              <input
                type="number"
                name="quantity"
                min="1"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, e)
                }
              />

              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                placeholder="Price"
                value={item.price}
                onChange={(e) =>
                  handleItemChange(index, e)
                }
              />

              <div className="item-total">
                Rs.{" "}
                {(
                  Number(item.quantity || 0) *
                  Number(item.price || 0)
                ).toFixed(2)}
              </div>

              <button
                type="button"
                className="delete-button"
                onClick={() => removeItem(index)}
              >
                Remove
              </button>

            </div>
          ))}
        </section>

        <section className="invoice-section totals-section">

          <div className="total-row">
            <span>Subtotal</span>

            <strong>
              Rs. {subtotal.toFixed(2)}
            </strong>
          </div>

          <div className="total-input">
            <label>Discount</label>

            <input
              type="number"
              name="discount"
              min="0"
              step="0.01"
              value={form.discount}
              onChange={handleFormChange}
            />
          </div>

          <div className="total-input">
            <label>Tax</label>

            <input
              type="number"
              name="tax"
              min="0"
              step="0.01"
              value={form.tax}
              onChange={handleFormChange}
            />
          </div>

          <div className="grand-total">
            <span>Total</span>

            <strong>
              Rs. {total.toFixed(2)}
            </strong>
          </div>

        </section>

        <button
          type="submit"
          className="primary-button save-invoice-button"
          disabled={loading}
        >
          {loading
            ? "Saving Invoice..."
            : "Save Invoice"}
        </button>

      </form>
    </div>
  );
};

export default CreateInvoice;