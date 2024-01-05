const { default: mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    image: String,
    fileName: String, 
  });

  module.exports = {
    SliderImage: mongoose.model("SliderImage", imageSchema),
  };
  