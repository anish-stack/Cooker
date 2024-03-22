const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  product: [
    {
      id: { type: String },
      name: { type: String },
      price: { type: Number },
      quantity: { type: Number },
      image: [{ type: String }], // Define image as an array of strings
      sizes: { type: String }
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  address: [
    {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: Number },
      landmark: { type: String },
    },
  ],
  TotalAmount:{ type: String },
  PaymentDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },
  transicationId:{
    type: String
  },
  PyamentType:{
    type: String,
    default: "Cod",

  },
  orderStatus: {
    type: String,
    default: "Order Confirmation Pending"    ,
  },
}, { timestamps: true });

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
