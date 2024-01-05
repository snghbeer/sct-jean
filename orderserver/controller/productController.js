const { Storage } = require("@google-cloud/storage");
const { default: mongoose } = require("mongoose");

const { Category, Product, SuperCategory } = require("../models/product");
const { Record } = require("../models/record");
const { Table } = require("../models/orderer");
const { Promotion } = require("../models/promotion");

const CACHE_MAXSIZE = 100;

//CATEGORY

class ProductManager {

  constructor() {
    this.categories = new Map();
    this.supercats = []
    this.products = new Map();
    this.storage = new Storage();
    this.initCache();
  }

  async initCache() {
    const [prods, cats] = await Promise.all([
      this.getAllProducts(),
      this.getCategories(),
    ]);
    for (let prod of prods) {
      this.products.set(prod.id, prod);
    }
    for (let cat of cats.categories) {
      this.categories.set(cat.id, cat);
    }
    this.supercats = cats.supercategories
  }

  // Uploads a local file to the bucket
  async uploadImage(filePath) {
    // Uploads a local file to the bucket
    await this.storage
      .bucket(process.env.google_storage_bucket)
      .upload(filePath);
    console.log(
      `${filePath} uploaded to ${process.env.google_storage_bucket}.`
    );
  }

  async addSuperCategory(catName) {
    try {
      const options = { upsert: true, new: true };
      const aCategory = new SuperCategory(
        { name: catName }
      )
        await aCategory.save()
      console.log("Adding new super category...");
      return aCategory;
    } catch (err) {
      // Handle or log the specific error
      console.error(err);
      return false;
    }
  }
  
  async addNewCategory(catName, parentCategory) {
    try {
      const superCat = await SuperCategory.findOne({ name: parentCategory }).exec();
      const res = await Category.findOne({ name: catName }).exec();
  
      if (!res) {
        console.log("Adding new category...");
        const aCategory = new Category({
          name: catName,
          superCategory: superCat.id,
        });
        await aCategory.save();
  
        this.categories.set(aCategory.id, aCategory); //add to cache
  
        const session = await mongoose.startSession();
        session.startTransaction();
  
        try {
          await aCategory.save({ session });
          await superCat.save({ session });
          await session.commitTransaction();
          return aCategory;
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
      } else {
        return null;
      }
    } catch (err) {
      // Handle or log the specific error
      console.error(err);
      return false;
    }
  }
  
  async updateCategory(id, newData) {
    try{
      var aCategory;
      console.log("Updating category with ID: " + id);
      aCategory = await Category.findByIdAndUpdate(id, newData, { new: true });
      this.categories.set(id, aCategory); //update cache
      const cats = await this.getCategories()
      return cats.categories;
    }
    catch(err){}
  }

  async deleteCategory(id) {
    console.log("Deleting category with ID: " + id);
    const aCat = await Category.findOneAndDelete({ _id: id });
    await Product.deleteMany({ category: id }); //cascade delete
    this.categories.delete(id); //delete from cache
    await this.initCache()
    return aCat;
  }

  async getCategories() {
    if (this.categories.size > 0)
      return {
        categories: Array.from(this.categories.values()),
        supercategories: this.supercats,
      }
    else {
      //console.log("Fetching all categories...")
      const cats = await Category.find().exec();
      const supercats = await SuperCategory.find().exec();

      return {
        categories: cats,
        supercategories: supercats,
      };
    }
  }

  async getCategoriesBy(name) {
    if (this.categories.length > 0)
      return this.categories;
    else {
      //console.log("Fetching all categories...")
      const cats = await Category.find({name: name}).exec();
      const supercats = await SuperCategory.find().exec();
      return {
        categories: cats,
        supercategories: supercats,
      };
    }
  }

  //PRODUCT
  //get all products of a category
  async getProducts(category) {
    var prods;
    console.log("Fetching products for category: " + category);
    prods = await Category.findOne({ _id: category })
      .populate("products")
      .exec();
    return prods.products;
  }

  //get all products
  async getAllProducts() {
    if (this.products.size > 0) return Array.from(this.products.values());
    else {
      var prods;
      prods = await Product.find().exec();
      return prods;
    }
  }

  //get from offset to limit
  async getAllProductsWithLimitOffset(limit, offset) {
    var prods;
    prods = await Product.find().skip(offset).limit(limit).exec(); //skip "offset" positions, and take "limit" records
    return prods;
  }
  //get by id
  async getProduct(id) {
    var prod;
    console.log("Fetching product with ID: " + id);
    prod = await Product.findById(id).exec();
    return prod;
  }

  async addProduct(data) {
    console.log("Adding new product...");
    const aCat = await Category.findOne({ name: data.category }).exec();
    if (aCat) {
      const aProduct = new Product({
        name: data.name,
        price: data.price,
        description: data.description,
        category: aCat.id,
        quantity: data.quantity,
        image: data.image,
        fname: data.fname,
        composition: data.composition
      });
      await aProduct.save();
      aCat.products.push(aProduct);
      this.products.set(aProduct.id, aProduct); //add to cache
      await aCat.save();
    } else {
      const [newCategory, aProduct] = await Promise.all([
        addNewCategory(data.category, true),
        new Product({
          name: data.name,
          price: this.round(data.price) /* parseFloat(data.price.toFixed(2)) */,
          description: data.description,
          category: newCategory.id,
          quantity: data.quantity,
          image: data.image,
          composition: data.composition
        }).save(),
      ]);
      newCategory.products.push(aProduct);
      this.products.set(aProduct.id, aProduct); //add to cache
      await newCategory.save();
    }
  }

  async updateProduct(id, newData) {
    const prod = await Product.findByIdAndUpdate(id, newData, { new: true });
    this.products.set(prod.id, prod); //update cache
    const prods = await this.getAllProducts()
    return {product: prod, products: prods};
  }

  async deleteProduct(id) {
    const prod = await Product.findByIdAndDelete({ _id: id });
    this.products.delete(id); //delete from cache
    return prod;
  }

  round(num) {
    return (Math.floor(num * 100) / 100);
  }

  applyPromos(items, promos) {
    let newTotal = 0;

    const updatedItems = items.map(item1 => {
      const promoItem = promos.find(item2 => item2.productName === item1.product);
  
      if (promoItem) {
        const discountedPrice = item1.price * (1 - promoItem.promotion);
        item1.price = this.round(discountedPrice) //parseFloat(discountedPrice.toFixed(2)); // Round to 2 decimal places
      }
  
      newTotal += this.round(item1.amount * item1.price);
      return item1;
    });
    newTotal = newTotal * 1.21 //VAT
    newTotal = parseFloat((newTotal).toFixed(2)) //parseFloat(newTotal.toFixed(2)); // Round the final total to 2 decimal places  
    return { discountedItems: updatedItems, total: newTotal };
  }

  checkIntegrity(recordTotal, discountedTotal) {
    return recordTotal === discountedTotal
  }

  sanitizeRecords(products, records){
    for (const record of records) {    
      const matchingProduct = products.find((product) => product.id === record.id);
    
      if (matchingProduct) {
        record.price = matchingProduct.price;
      }
    }
  }

  //pay by card
  async sellProduct(record) {
    const aTable = await Table.findOne({subId: record.table}).exec();
    const promos = await Promotion.find().exec();
    const products = await this.getAllProducts()
    const items = record.items
    this.sanitizeRecords(products, items)

    //console.log({beforeDiscount: items, total: record.total})
    const promodItems = this.applyPromos(items, promos)
    //console.log(promodItems)
    const canOrder = this.checkIntegrity(promodItems.total, record.total)
    if(!canOrder) throw new Error(`You cannot modify the price of a product!`);
    //console.log("No man in the middle attack")
    if(aTable){
      const aRecord = new Record({
        total: promodItems.total,
        records: promodItems.discountedItems,
        uuid: record.uuid,
        by: record.table
      });
  
      const order = await aRecord.save();
      return order;
    }else{
      throw new Error(`Table ${record.table} does not exist!`);
    }
  }

  //pay cash
  async updateOrderTotal(id = undefined, record){
    const aTable = await Table.findOne({subId: record.table}).exec();
    const promos = await Promotion.find().exec();
    const products = await this.getAllProducts()
    const items = record.items
    this.sanitizeRecords(products, items)

    const promodItems = this.applyPromos(items, promos)
    const canOrder = this.checkIntegrity(promodItems.total, record.total)
    if(!canOrder) throw new Error(`You cannot modify the price of a product!`);
    if(!aTable) throw new Error(`Table ${record.table} does not exist!`);

    if(!id){
      const aRecord = new Record({
        total: promodItems.total,
        records: promodItems.discountedItems,
        uuid: record.uuid,
        by: record.table
      });
      const order = await aRecord.save();
      return order;
    }
    else{
      const order = await Record.findById(id).exec()
      const oldRecords = order.records
      order.records = [...oldRecords, ...promodItems.discountedItems]
      order.total += this.round(promodItems.total)
      const updatedOrder = await order.save();
      return updatedOrder;
    }
  }

  async getRecords() {
    try {
      const recs = await Record.find({ confirmed: true }).exec();
      return recs;
    } catch (error) {
      // Handle any errors that occur during the query
      console.error(error);
      throw error;
    }
  }
}

module.exports = {
  ProductManager: ProductManager,
};
