const { default: mongoose } = require("mongoose");
const { Activity, Booking } = require("../models/activity");
const { Category } = require("../models/product");

//Activity
async function addActivity(data) {
    try{
      const aCat = await Category.findOne({ name: data.category }).exec();
      const newData = {...data}
      newData.category = aCat.id
      const fActivity = new Activity(newData);
      await fActivity.save();
    }
    catch(err){
      console.log(err)
    }
}

async function getfActivities() {
  const activities = await Activity.find().exec();
  return activities;
}

async function getfActivity(id) {
  try {
    const fActivity = await Activity.findById(id);
    return fActivity;
  } catch (err) {
    return false;
  }
}

//when clicking on an activity, fetch all bookings related 
//to that activity for the current month
async function getBookings(activityId){
  const currentDate = new Date();

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Create the aggregation pipeline
  return Booking.aggregate([
    // Match bookings with the specified activityId
    { $match: { activity: mongoose.Types.ObjectId(activityId) } },

    // Match bookings with the date within the current month
    { $match: { date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } }
  ]).exec();
}

async function checkBookings(activityId) {
  const currentDate = new Date();

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Create the aggregation pipeline
  return Booking.aggregate([
    // Match bookings with the specified activityId
    { $match: { activity: mongoose.Types.ObjectId(activityId) } },

    // Match bookings with the date within the current month
    { $match: { date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } },

    // Project only the desired fields
    { $project: { _id: 0, activity: 1, date: 1, durationOptions: 1 } }
  ]).exec();
}

async function updatefActivity(id, newData) {
    const fActivity = await Activity.findByIdAndUpdate(id, newData, {
        new: true,
      });
      return fActivity;
}

async function deletefActivity(id) {
    const fActivity = await Activity.findByIdAndDelete(id);
    return fActivity;
}

async function addfActivity(data) {
  try {
    const fActivity = new Activity(data);
    await fActivity.save();
    return fActivity;
  } catch (err) {
    return false;
  }
}

module.exports = {
  addActivity,
  getfActivities,
  getfActivity,
  updatefActivity,
  deletefActivity,
  getBookings
};
