const { default: mongoose } = require("mongoose");
const { SliderImage } = require("../models/sliderImg");

async function addSliderImage(data) {
  try {
    const anImage = new SliderImage({
      image: data.image,
      fileName: data.fileName
    });
    await anImage.save();
    return true;
  } catch (err) {
    // Handle or log the specific error
    console.error(err);
    return false;
  }
}

async function deleteSliderImage(id) {
  try {
    const deleted = await SliderImage.findOneAndDelete({ _id: id }, { useFindAndModify: false });
    return deleted;
  } catch (err) {
    // Handle or log the specific error
    console.error(err);
    return false;
  }
}

async function getImages() {
    try {
        const imgs = await SliderImage.find().exec();
        return imgs;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

module.exports = {
    addSlider: addSliderImage,
    deleteSlider: deleteSliderImage,
    getSliders: getImages
  };