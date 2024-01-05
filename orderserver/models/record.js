const { default: mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const SaleRecordSchema = new Schema({
  records: [
    {
      product: String,  
      amount: Number,
      price: Number,
      note: String,
    }
  ],
  date: { type: Date, default: () => Date.now()},
  total: Number,
  fulfilled: { type: Boolean, default: false}, //order is fulfilled
  by: Number, //ordered by
  waiter: { type: String, default: "" }, //who takes cares of the order
  confirmed: { type: Boolean, default: false}, //when the order IS PAID, then it is confirmed
  uuid: String,
  checkoutId: String

});


module.exports = {
    Record: mongoose.model("Record", SaleRecordSchema)
};