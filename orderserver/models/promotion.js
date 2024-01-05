const { default: mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const promoSchema = new Schema({
  promotion: { type: Number, required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true }, //one to many, 1 category has many products
  productName: { type: String, required: true }
});

module.exports = {
  Promotion: mongoose.model("Promo", promoSchema),
};
