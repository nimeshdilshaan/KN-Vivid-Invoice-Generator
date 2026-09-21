const fs = require("fs");
const path = require("path");

const invoicesFile = path.join(
  __dirname,
  "../data/invoices.json"
);

const counterFile = path.join(
  __dirname,
  "../data/counter.json"
);

// ==============================
// INVOICE FILE FUNCTIONS
// ==============================

const readInvoices = () => {
  if (!fs.existsSync(invoicesFile)) {
    fs.writeFileSync(invoicesFile, "[]");
  }

  const data = fs.readFileSync(
    invoicesFile,
    "utf-8"
  );

  return data ? JSON.parse(data) : [];
};

const saveInvoices = (invoices) => {
  fs.writeFileSync(
    invoicesFile,
    JSON.stringify(invoices, null, 2)
  );
};

// ==============================
// COUNTER FUNCTIONS
// ==============================

const readCounter = () => {
  if (!fs.existsSync(counterFile)) {
    fs.writeFileSync(
      counterFile,
      JSON.stringify({}, null, 2)
    );
  }

  const data = fs.readFileSync(
    counterFile,
    "utf-8"
  );

  return data ? JSON.parse(data) : {};
};

const saveCounter = (counter) => {
  fs.writeFileSync(
    counterFile,
    JSON.stringify(counter, null, 2)
  );
};

// ==============================
// FORMAT INVOICE NUMBER
// ==============================

const formatInvoiceNumber = (number) => {
  return `INVOICE-${String(number).padStart(
    4,
    "0"
  )}`;
};

// ==============================
// GET CURRENT INVOICE NUMBER
// ==============================

const getCurrentInvoiceNumber = (
  req,
  res
) => {
  try {
    const counter = readCounter();

    const userId = req.user.userId;

    // First-time user starts from 800
    if (!counter[userId]) {
      counter[userId] = 800;

      saveCounter(counter);
    }

    const currentNumber =
      counter[userId];

    res.json({
      currentNumber,

      invoiceNumber:
        formatInvoiceNumber(
          currentNumber
        )
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to get current invoice number"
    });
  }
};

// ==============================
// UPDATE CURRENT INVOICE NUMBER
// ==============================

const updateCurrentInvoiceNumber = (
  req,
  res
) => {
  try {
    const { number } = req.body;

    const newNumber = Number(number);

    if (
      !Number.isInteger(newNumber) ||
      newNumber < 1
    ) {
      return res.status(400).json({
        message:
          "Invoice number must be a positive number"
      });
    }

    const counter = readCounter();

    const userId = req.user.userId;

    // First-time user starts from 800
    if (!counter[userId]) {
      counter[userId] = 800;
    }

    const currentNumber =
      counter[userId];

    const difference =
      newNumber - currentNumber;

    // Maximum change is +5 or -5
    if (Math.abs(difference) > 5) {
      return res.status(400).json({
        message:
          "You can change the invoice number by maximum 5 at a time"
      });
    }

    counter[userId] = newNumber;

    saveCounter(counter);

    res.json({
      message:
        "Invoice number updated successfully",

      currentNumber:
        counter[userId],

      invoiceNumber:
        formatInvoiceNumber(
          counter[userId]
        )
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to update invoice number"
    });
  }
};

// ==============================
// CREATE INVOICE
// ==============================

const createInvoice = (
  req,
  res
) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      invoiceDate,
      items,
      discount,
      tax
    } = req.body;

    if (!customerName) {
      return res.status(400).json({
        message:
          "Customer name is required"
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        message:
          "At least one invoice item is required"
      });
    }

    const invoices =
      readInvoices();

    // ==============================
    // GET USER'S COUNTER
    // ==============================

    const counter =
      readCounter();

    const userId =
      req.user.userId;

    // First-time user starts from 800
    if (!counter[userId]) {
      counter[userId] = 800;
    }

    // Generate invoice number
    const invoiceNumber =
      formatInvoiceNumber(
        counter[userId]
      );

    // ==============================
    // CALCULATE ITEMS
    // ==============================

    const calculatedItems =
      items.map((item) => {
        const quantity =
          Number(item.quantity);

        const price =
          Number(item.price);

        return {
          description:
            item.description,

          quantity,

          price,

          total:
            quantity * price
        };
      });

    // ==============================
    // CALCULATE TOTALS
    // ==============================

    const subtotal =
      calculatedItems.reduce(
        (sum, item) =>
          sum + item.total,
        0
      );

    const discountAmount =
      Number(discount) || 0;

    const taxAmount =
      Number(tax) || 0;

    const total =
      subtotal -
      discountAmount +
      taxAmount;

    // ==============================
    // CREATE INVOICE
    // ==============================

    const newInvoice = {
      id: Date.now().toString(),

      invoiceNumber,

      customerName,

      customerEmail:
        customerEmail || "",

      customerPhone:
        customerPhone || "",

      customerAddress:
        customerAddress || "",

      invoiceDate:
        invoiceDate ||
        new Date().toISOString(),

      items:
        calculatedItems,

      subtotal,

      discount:
        discountAmount,

      tax:
        taxAmount,

      total,

      createdBy:
        userId,

      createdAt:
        new Date().toISOString()
    };

    invoices.push(
      newInvoice
    );

    saveInvoices(
      invoices
    );

    // ==============================
    // INCREASE ONLY THIS USER'S
    // INVOICE NUMBER
    // ==============================

    counter[userId] =
      counter[userId] + 1;

    saveCounter(
      counter
    );

    res.status(201).json(
      newInvoice
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to create invoice"
    });
  }
};

// ==============================
// GET ALL INVOICES
// ==============================

const getInvoices = (
  req,
  res
) => {
  try {
    const invoices =
      readInvoices();

    // Only return invoices
    // belonging to logged-in user
    const userInvoices =
      invoices.filter(
        (invoice) =>
          invoice.createdBy ===
          req.user.userId
      );

    userInvoices.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    res.json(
      userInvoices
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to get invoices"
    });
  }
};

// ==============================
// GET SINGLE INVOICE
// ==============================

const getInvoiceById = (
  req,
  res
) => {
  try {
    const invoices =
      readInvoices();

    const invoice =
      invoices.find(
        (invoice) =>
          invoice.id ===
            req.params.id &&
          invoice.createdBy ===
            req.user.userId
      );

    if (!invoice) {
      return res.status(404).json({
        message:
          "Invoice not found"
      });
    }

    res.json(
      invoice
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to get invoice"
    });
  }
};

// ==============================
// UPDATE INVOICE
// ==============================

const updateInvoice = (
  req,
  res
) => {
  try {
    const invoices =
      readInvoices();

    const invoiceIndex =
      invoices.findIndex(
        (invoice) =>
          invoice.id ===
            req.params.id &&
          invoice.createdBy ===
            req.user.userId
      );

    if (invoiceIndex === -1) {
      return res.status(404).json({
        message:
          "Invoice not found"
      });
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      invoiceDate,
      items,
      discount,
      tax
    } = req.body;

    if (!customerName) {
      return res.status(400).json({
        message:
          "Customer name is required"
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        message:
          "At least one invoice item is required"
      });
    }

    // ==============================
    // CALCULATE ITEMS
    // ==============================

    const calculatedItems =
      items.map((item) => {
        const quantity =
          Number(item.quantity);

        const price =
          Number(item.price);

        return {
          description:
            item.description,

          quantity,

          price,

          total:
            quantity * price
        };
      });

    // ==============================
    // CALCULATE TOTALS
    // ==============================

    const subtotal =
      calculatedItems.reduce(
        (sum, item) =>
          sum + item.total,
        0
      );

    const discountAmount =
      Number(discount) || 0;

    const taxAmount =
      Number(tax) || 0;

    const total =
      subtotal -
      discountAmount +
      taxAmount;

    // ==============================
    // UPDATE INVOICE
    // ==============================

    invoices[invoiceIndex] = {
      ...invoices[invoiceIndex],

      // Original invoice number
      // is preserved
      invoiceNumber:
        invoices[invoiceIndex]
          .invoiceNumber,

      customerName,

      customerEmail:
        customerEmail || "",

      customerPhone:
        customerPhone || "",

      customerAddress:
        customerAddress || "",

      invoiceDate:
        invoiceDate ||
        invoices[invoiceIndex]
          .invoiceDate,

      items:
        calculatedItems,

      subtotal,

      discount:
        discountAmount,

      tax:
        taxAmount,

      total,

      updatedAt:
        new Date().toISOString()
    };

    saveInvoices(
      invoices
    );

    res.json(
      invoices[invoiceIndex]
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to update invoice"
    });
  }
};

// ==============================
// DELETE INVOICE
// ==============================

const deleteInvoice = (
  req,
  res
) => {
  try {
    const invoices =
      readInvoices();

    const invoiceIndex =
      invoices.findIndex(
        (invoice) =>
          invoice.id ===
            req.params.id &&
          invoice.createdBy ===
            req.user.userId
      );

    if (invoiceIndex === -1) {
      return res.status(404).json({
        message:
          "Invoice not found"
      });
    }

    invoices.splice(
      invoiceIndex,
      1
    );

    saveInvoices(
      invoices
    );

    res.json({
      message:
        "Invoice deleted successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to delete invoice"
    });
  }
};

// ==============================
// EXPORT
// ==============================

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getCurrentInvoiceNumber,
  updateCurrentInvoiceNumber
};

