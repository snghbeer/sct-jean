const { default: mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  name: String,
  date: String,
  startTime: {type: Number},
  duration: Number, //in minutes
  total: {
    type:Number,
    default: 0
  }, //price
  closed: {
    type: Boolean,
    default: false
  }
});

module.exports = {
  Session: mongoose.model("Session", sessionSchema),
};
