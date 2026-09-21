const express = require("express");

const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
} = require("../controllers/invoiceController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createInvoice);

router.get("/", getInvoices);

router.get("/:id", getInvoiceById);

router.put("/:id", updateInvoice);

router.delete("/:id", deleteInvoice);

module.exports = router;