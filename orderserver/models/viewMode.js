const { default: mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const viewSchema = new Schema({
    tag: String,
    mode: {type: Number, default: 0},
  });

  module.exports = {
    ViewMode: mongoose.model("ViewMode", viewSchema),
  };
