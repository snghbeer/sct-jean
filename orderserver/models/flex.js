const { default: mongoose } = require("mongoose");
const Schema = mongoose.Schema;
const { activitySchema } = require('./activity')

const flexActivitySchema = activitySchema.discriminator('FlexActivity', new Schema({
    duration2: {type: Number, required: false},
    date2: {type: Date, required: false}, //isoString
    start2: {type: Date, required: false}, //isoString
  }));
  
  const FlexActivity = mongoose.model("FlexActivity", flexActivitySchema);
  
module.exports = mongoose.models.FlexActivity || FlexActivity;