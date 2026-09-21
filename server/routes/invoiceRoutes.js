const express = require("express");

const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getCurrentInvoiceNumber,
  updateCurrentInvoiceNumber
} = require("../controllers/invoiceController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Current invoice number
router.get(
  "/counter",
  getCurrentInvoiceNumber
);

// Change invoice number
router.put(
  "/counter",
  updateCurrentInvoiceNumber
);

// Invoice routes
router.post(
  "/",
  createInvoice
);

router.get(
  "/",
  getInvoices
);

router.get(
  "/:id",
  getInvoiceById
);

router.put(
  "/:id",
  updateInvoice
);

router.delete(
  "/:id",
  deleteInvoice
);

module.exports = router;