const mongoose = require("mongoose");
const ethereumPriceSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("ethereum", ethereumPriceSchema);
