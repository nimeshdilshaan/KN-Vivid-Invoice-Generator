const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    _id: false
  }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },

    customerName: {
      type: String,
      required: true,
      trim: true
    },

    customerEmail: {
      type: String,
      trim: true
    },

    customerPhone: {
      type: String,
      trim: true
    },

    customerAddress: {
      type: String,
      trim: true
    },

    invoiceDate: {
      type: Date,
      required: true
    },

    items: {
      type: [invoiceItemSchema],
      required: true
    },

    subtotal: {
      type: Number,
      required: true
    },

    discount: {
      type: Number,
      default: 0
    },

    tax: {
      type: Number,
      default: 0
    },

    total: {
      type: Number,
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
