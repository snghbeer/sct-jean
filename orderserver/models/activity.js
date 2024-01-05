const { default: mongoose } = require("mongoose");
const Schema = mongoose.Schema;
const { body } = require('express-validator');

/* for example:
[
    { duration: 1, pricing: 10 }, // 10 euros for 1 hour
    { duration: 2, pricing: 17 }, // 17 euros for 2 hours
    { duration: 4, pricing: 25 }, // 25 euros for 4 hours
    { duration: 0, pricing: 25 } // 0 hours for entire session
    // Add more duration options as needed
  ]
*/
const durationOptionSchema = new mongoose.Schema({
  duration: { type: Number, required: true },
  pricing: { type: Number, required: true },
});

// Define the base schema
const activitySchema = new Schema({
  name: {type: String, required: true},
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  image: {type: String, required: true},
  fname: {type: String, required: true},

  durationOptions: [durationOptionSchema],
  start: {type: Date, required: true},
  end: {type: Date, required: true},
  //optional properties
  description: String,
  location: String,
});

const bookingSchema = new mongoose.Schema({
  activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  date: { type: Date, required: true }, //iso string (YYYY-MM-DD:hh:mm)
  durationOptions: durationOptionSchema,
  amount: { type: Number, required: true },
  
  confirmed: { type: Boolean, default: false}, //when the order IS PAID, then it is confirmed
  payment_method: String,
  uuid: String,
});

const Activity = mongoose.model("Activity", activitySchema);
const Booking = mongoose.model("Booking", bookingSchema);



const validateDurationOptions = body('durationOptions')
  .custom((value) => {
    const parsedPricing = JSON.parse(value);
    console.log(parsedPricing);

    if (!Array.isArray(parsedPricing) || parsedPricing.length === 0) {
      throw new Error('durationOptions must be a non-empty array');
    }

    // Add further custom validation for each element if needed
    for (let item of parsedPricing) {
      if (typeof item.duration !== "number") {
        throw new Error("Duration should be a number");
      }
      if (typeof item.pricing !== "number" || isNaN(item.pricing)) {
        throw new Error("Price should be a number");
      }
    }

    // If everything is valid, return true
    return true;
  });


// Create models based on the child schemas
module.exports = {
  Activity, Booking, validateDurationOptions
}
  
