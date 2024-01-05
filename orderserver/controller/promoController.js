const { default: mongoose } = require("mongoose");
const { Promotion } = require("../models/promotion");
const { Product } = require("../models/product");

async function findPromoById(id) {
  try {
    const aPromo = await Promotion.findById(id);
    return aPromo;
  } catch (err) {
    console.log(err);
  }
}

async function findPromoByProduct(productId) {
  try {
    const aPromo = await Promotion.findOne({ product: productId });
    return aPromo;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function addPromo(promo, productId) {
  try {
    const aProduct = await Product.findById(productId);
    if (!aProduct) throw new Error(`Product with id ${productId} does not exist.`); //return;
    let aPromo = await findPromoByProduct(aProduct.id);
    if (!aPromo) {
      if (promo !== 0) {
        aPromo = new Promotion({
          promotion: promo,
          product: aProduct.id,
          productName: aProduct.name
        });
        await aPromo.save();
      }
    } 
    else {
      console.log(promo)
      if (promo > 0) {
        aPromo.promotion = promo;
        await aPromo.save();
      } else await aPromo.remove();
    }
   // return aPromo;
  } catch (err) {
    console.error(err);
    //return null;
  }
}

async function getPromos(){
    const promos = await Promotion.find().exec();
    return promos;
}

module.exports = {
  findPromoById,
  findPromoByProduct,
  addPromo,
  getPromos
};
