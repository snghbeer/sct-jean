const { default: mongoose } = require("mongoose");
const { ViewMode } = require("../models/viewMode");

//View
 async function addView(view) {
  // Check if a view with the same mode already exists in the database
  let existingView = await ViewMode.findOne({ tag: "view" });
  // If a view with the same mode already exists, do nothing
  if (!existingView) existingView = new ViewMode({ tag: "view"})
  // If a view with the same mode doesn't exist, add the new view
  existingView.mode = view
  await existingView.save();
  console.log("View added successfully.");
}
 async function getView() {
  try {
    const aView = await ViewMode.findOne({
      tag: "view",
    });
    return aView;
  } catch (err) {
    return false;
  }
}

module.exports = {
  getView: getView,
  addView: addView
};