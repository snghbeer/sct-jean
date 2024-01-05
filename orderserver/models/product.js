const { default: mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const superCategorySchema = new Schema({
  name: { type: String, default: "food" },
  categories: [{ type: Schema.Types.ObjectId, ref: "Category" }], //one to many, 1 super category has many categories
});

const categorySchema = new Schema({
  name: String,
  superCategory: { type: Schema.Types.ObjectId, ref: "SuperCategory" }, //one to one, each category has only 1 super category
  products: [{ type: Schema.Types.ObjectId, ref: "Product" }], //one to many, 1 category has many products
  activities: [{ type: Schema.Types.ObjectId, ref: "Activity" }]
});

const productSchema = new Schema({
  name: String,
  category: { type: Schema.Types.ObjectId, ref: "Category" }, //one to one, each product has only 1 category
  price: Number,
  description: String,
  quantity: Number,
  image: String,
  fname: String,
  composition: [{type: String}]
});

module.exports = {
  SuperCategory: mongoose.model("SuperCategory", superCategorySchema),
  Category: mongoose.model("Category", categorySchema),
  Product: mongoose.model("Product", productSchema),
};
