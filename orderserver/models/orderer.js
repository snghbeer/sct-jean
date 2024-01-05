const { default: mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const ordererSchema = new Schema({
  subId: {
    unique: true,
    type: Number,
    required: true,
  },
  closed: {
    type: Boolean,
    default: false
  },
  total: {
    type:Number,
    default: 0
  }, //price
  orders: [
    { type: Schema.Types.ObjectId, ref: 'Record' }
  ],
});

module.exports = {
    Table: mongoose.model("Table", ordererSchema),
    Room: mongoose.model("Room", ordererSchema)
  };