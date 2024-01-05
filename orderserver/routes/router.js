require("express-router-group");
const express = require("express");
const { ProductManager } = require("../controller/productController");
const { RecordController } = require("../controller/recordController");

const { FileManager } = require("../controller/fileSystemController");
const { fetchUser, registerUser } = require("../controller/userController");
const { OrderGenerator } = require("../controller/orderingController");
const { SessionController } = require("../controller/sessionController");

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const { v4: uuidv4 } = require("uuid");

var bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const mkdirp = require('mkdirp');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, file.originalname);
  },
}); 

mkdirp.sync('uploads/');
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
  fileFilter: (req, file, cb) => {
    // accept only jpeg or png files
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});
const jwt = require("jsonwebtoken");
const {
  addSlider,
  deleteSlider,
  getSliders,
} = require("../controller/sliderImageController");
const {
  getfActivities,
  updatefActivity,
  deletefActivity,
  addActivity,
  getBookings,
} = require("../controller/activityController");
const { addView, getView } = require("../controller/viewController");
const { default: mongoose } = require("mongoose");
const { validateDurationOptions } = require("../models/activity");
const { addPromo, getPromos } = require("../controller/promoController");

const jsonParser = bodyParser.json();

const resizedFolder = path.join("uploads", "resized");
if (!fs.existsSync(resizedFolder)) {
  fs.mkdirSync(resizedFolder, { recursive: true });
  console.log("Folder created successfully");
}

const productManager = new ProductManager();
const recordController = new RecordController();
const fileManager = new FileManager();
const orderer = new OrderGenerator();
const sessManager = new SessionController();

const LIMIT = 1000 * 60 * 60 * 24; //equivalent to 24 hours 86 400 000

//MIDDLEWARE function

function checkIsManager(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1]; //because Auhtorization header contains "Bearer tokenXYZ", so we split string and only take the 2nd part of string
    if ((token === null || token === undefined) && req.session) {
      console.log("unauthorized request");
      return res.sendStatus(401);
    }
    jwt.verify(token, process.env.privateKey, (err, userSession) => {
      //verifies if JWT token is valid or not
      if (err) return res.sendStatus(403);
      if (userSession.role === 1 || userSession.role === 0) {
        //console.log(`${userSession.username} is a manager`)
        next();
      } else throw new Error("You're not an admin!");
    });
  } catch (err) {
    var myerr = new Error("You're not an admin!");
    res.status(403).send(myerr.message);
  }
}

class RouterHandler {
  selectedView;
  sliderCache;

  constructor(socket) {
    this.socket = socket;
    //const aRouter = express.Router();

    this.sliderCache = new Map();
    this.homeRouter = this.#initRoutes(socket);
    this.selectedView = null;
  }

  #initRoutes(socket) {
    const aRouter = express.Router();

    aRouter.group("/v1", (subRouter) => {
      subRouter.get(
        "/test",
        /*checkIsManager,*/ async function (req, res) {
          try {
            console.time();
            let cats = await recordController.getRecords();
            //console.log(cats.find((cat) => cat._id.equals("640e3c3d928fdf3db2016809")))
            //console.log(recs)
            console.timeEnd();
            res.status(200).json({ records: cats });
          } catch (err) {
            console.log(err);
          }
        }
      );

      subRouter.get("/login", function (req, res) {
        const registerUrl = req.baseUrl + "/register";
        const loginrUrl = req.baseUrl + "/login";

        res.render("index", { registerUrl: registerUrl, loginUrl: loginrUrl });
      });

      subRouter.post("/login", jsonParser, async function (req, res, next) {
        try{
          const data = req.body;
        await fetchUser(data.username, data.password, function (result) {
          if (!result.error) {
            const expirationTime = new Date(Date.now() + LIMIT);
            const userSession = {
              username: result.aUser.username,
              role: result.aUser.privilege,
              expirationTime: expirationTime,
            };
            const token = jwt.sign(userSession, process.env.privateKey, {
              algorithm: "HS256",
              expiresIn: LIMIT + "s",
            });
            res.cookie("token", token, {
              httpOnly: true,
              expires: expirationTime,
            });
            res.status(200).json({
              message: `User signed in succesfully as ${result.aUser.username}!`,
              success: true,
              token: token,
              role: result.aUser.privilege,
              id: result.aUser._id,
            });

            req.session.save((err) => {
              if (err) {
                console.log(err);
              }
            });
          } else res.status(400).json({ message: "Wrong credentials!", success: false });
        });
        }
        catch(err){
          res.status(500).json({ message: "Internal server error", success: false })
        }
      });

      subRouter.post("/logout", jsonParser, async function (req, res, next) {
        req.session.destroy((err) => {
          if (err) {
            console.error("Error destroying session:", err);
            return res.sendStatus(500);
          }
          // Clear session cookie from the client's browser
          res.clearCookie(process.env.cookieName); // Replace 'connect.sid' with your session cookie name, if different

          // Redirect to the home page or send a success message
          res.status(200).json({
            message: `User signed out succesfully!`,
            success: true,
          });
        });
      });

      subRouter.post("/register", jsonParser, async function (req, res) {
        const testUrl = req.get("host") + req.baseUrl;
        const data = req.body;
        const psw = data.password;
        const cpsw = data.cpassword;
        if (psw === cpsw) {
          try {
            const aUser = await registerUser(data);
            if (aUser) {
              console.log(aUser);
              /* var token = jwt.sign(
                { foo: process.env.payload },
                process.env.privateKey,
                { expiresIn: "3600s" }
              ); */ //token will expire after x seconds
              req.session.user = aUser;
              //res.redirect("/api/v1/dashboard")
              res.status(200).send({
                message: "User registered succesfully!",
                redirect: testUrl,
              });
            } else res.status(404).send("Something went wrong");
          } catch (err) {
            res.status(400).send(err._message);
          }
        } else res.status(403).send("Something went wrong");
      });

      subRouter.group("/product_manager",
        /* authenticateToken, */ (subRoute) => {
          //route with middleware using a jwt token

          subRoute.group("/slider", (subRoute) => {
            subRoute.get("/", jsonParser, async (req, res) => {
              try {
                let imgs;
                if (this.sliderCache && this.sliderCache.size === 0) {
                  console.log("No cached sliders: Filling cache...");
                  imgs = await getSliders();
                  imgs.forEach((obj) => {
                    this.sliderCache.set(obj.fileName, obj);
                  });
                } else imgs = Array.from(this.sliderCache.values());

                res.status(200).json({ sliders: imgs, success: true });
              } catch (err) {
                res
                  .status(400)
                  .json({ message: "Bad request", success: false });
              }
            });

            subRoute.post("/", checkIsManager, jsonParser,
              upload.single("image"),
              async (req, res) => {
                try {
                  const fPath = req.file.path;
                  console.log(req.file)
                  const imgUrl = `https://storage.googleapis.com/${process.env.google_storage_bucket}/${req.file.originalname}`;
                  const fileData = {
                    image: imgUrl,
                    fileName: req.file.originalname,
                  };
                  const uploadPromise = fileManager.uploadImageToCloud(fPath);
                  const addSliderPromise = addSlider(fileData);
                  this.sliderCache.set(req.file.originalname, fileData);

                  Promise.all([uploadPromise, addSliderPromise])
                    .then(async ([uploadResult, addSliderResult]) => {
                      const currItems = await getSliders();
                      res
                        .status(200)
                        .json({
                          msg: "Slider added succesfully!",
                          success: true,
                          sliders: currItems,
                        });
                    })
                    .catch((error) => {
                      // Handle error
                      console.error(error);
                      res.status(500).json({
                        message: "Error adding slider",
                        success: false,
                      });
                    });
                } catch (err) {
                  console.error(err);
                  res
                    .status(400)
                    .json({ message: "Bad request", success: false });
                }
              }
            );

            subRoute.delete("/", checkIsManager,
              upload.single("image"), jsonParser,
              async (req, res) => {
                try {
                  const imgId = req.body.id;
                  if (!mongoose.isValidObjectId(imgId)) {
                    return res.status(400).json({ message: "Invalid id" });
                  }
                  const deleted = await deleteSlider(imgId);
                  this.sliderCache.delete(deleted.fileName);

                  const [deletePromise, currItems] = await Promise.all([
                    fileManager.deleteImgInCloud(deleted.fileName),
                    getSliders(),
                  ]);
                  res
                    .status(200)
                    .json({
                      msg: "Slider deleted successfully!",
                      success: true,
                      sliders: currItems,
                    });
                } catch (error) {
                  // Handle the error
                  console.error(error);
                  res
                    .status(500)
                    .json({ msg: "An error occurred", success: false });
                }
              }
            );
          });

          //Category endpoints
          subRoute.group("/category", (subRoute) => {
            subRoute.post( "/super", jsonParser,checkIsManager,
              async function (req, res) {
                body("name").isString().not().isEmpty(); //validation
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                  return res.status(400).json({ errors: errors.array() });
                } else {
                  const data = req.body.name.toLowerCase();
                  const succes = await productManager.addSuperCategory(data);
                  if (succes)
                    res
                      .status(200)
                      .json({
                        msg: "Category added succesfully!",
                        error: false,
                      });
                  else
                    res
                      .status(200)
                      .json({ msg: "Category already exists", error: true });
                }
              }
            );

            subRoute.post("/new", jsonParser, checkIsManager,
              async function (req, res) {
                body("name").isString().not().isEmpty(); //validation
                body("category").isString().not().isEmpty();
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                  return res.status(400).json({ errors: errors.array() });
                } else {
                  const data = req.body;
                  const categoryName = data.name.toLowerCase();
                  const superCategoryName = data.category.toLowerCase();

                  const success = await productManager.addNewCategory(
                    categoryName,
                    superCategoryName
                  );
                  if (success)
                    res
                      .status(200)
                      .json({
                        msg: "Category added succesfully!",
                        error: false,
                      });
                  else
                    res
                      .status(400)
                      .json({ msg: "Category already exists", error: true });
                }
              }
            );

            subRoute.get("/:cat/products", async function (req, res) {
              const cat = req.params.cat;
              if (!mongoose.isValidObjectId(cat)) {
                return res
                  .status(400)
                  .json({ message: "Invalid object ID", success: false });
              }

              try {
                const products = await productManager.getProducts({
                  cat: new ObjectId(cat),
                });
                res.status(200).send(products);
              } catch (err) {
                console.error(err);
                res
                  .status(400)
                  .json({ message: "Bad request", success: false });
              }
            });

            subRoute.get("/all", async function (req, res) {
              var cats;
              try {
                cats = await productManager.getCategories();
                res.json(cats);
              } catch (err) {
                console.error(err);
                res
                  .status(400)
                  .json({ message: "Bad request", success: false });
              }
            });

            subRoute.delete("/:id", checkIsManager, async function (req, res) {
              const id = req.params.id;

              // Validate if the 'id' parameter is a valid MongoDB Object ID
              if (!mongoose.isValidObjectId(id)) {
                return res
                  .status(400)
                  .json({ message: "Invalid object ID", success: false });
              }

              try {
                const deleted = await productManager.deleteCategory(id);
                if (deleted) {
                  res.status(200).send("Category deleted successfully!");
                } else {
                  res.status(404).send("Category does not exist");
                }
              } catch (err) {
                console.error(err);
                res.status(500).send("Server error");
              }
            });

            subRoute.put("/:id", jsonParser, checkIsManager,
              body("name").isString().not().isEmpty(),
              async function (req, res) {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                  console.log(errors)
                  return res.status(400).json({ errors: errors.array() });
                } else {
                  const id = req.params.id;
                  if (!mongoose.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({ message: "Invalid id" });
                  }
                  const newData = req.body;
                  const updated = await productManager.updateCategory(id, newData);
                  if (updated)
                  res.status(200).json({
                    message: "Category updated succesfully!",
                    success: true,
                    categories: updated
                  });
                  else res.status(404).send("Category does not exist");
                }
              }
            );
          });

          //Product endpoints
          subRoute.group("/product", (subRoute) => {
            subRoute.get("/all", async function (req, res) {
              try {
/*                 const productPromise = productManager.getAllProducts();
                const activityPromise = getfActivities();

                Promise.all([productPromise, activityPromise])
                .then(([products, activities]) => {
                  res.status(200).json({
                    success: true,
                    products: products,
                    activities: activities
                  });
                })    */
                const products = await productManager.getAllProducts()
                const promos = await getPromos()
                res.status(200).json({
                  success: true,
                  products: products,
                  promos: promos
                });
              } catch (err) {
                console.log(err);
                res.status(404).json({ message: "Not found" });
              }
            });

            //Endpoint to return values with limit & offset
            //optionally uses middleware -> uncomment to use
            //e.g., http://localhost:3000/api/v1/product/take?offset=2&limit=2
  /*           subRoute.get("/take", async function (req, res) {
              let offset = req.query.offset || 0;
              let limit = req.query.limit || 2;
              const products =
                await productManager.getAllProductsWithLimitOffset(
                  limit,
                  offset
                );
              res.json({ products: products });
            }); */

            subRoute.post("/new",jsonParser, checkIsManager,
              upload.single("image"),
              async function (req, res) {
                body("name").isString().not().isEmpty();
                body("price").isNumeric().not().isEmpty();
                body("category").isString().not().isEmpty();
                body("description").isString().not().isEmpty();
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                  return res.status(400).json({ errors: errors.array() });
                } else {
                  const data = req.body;
                  try {
                    const fPath = req.file.path;
                    const resizedImagePath = path.join(
                      "uploads",
                      "resized",
                      req.file.originalname
                    );
                    const fileName = req.file.originalname.replace(/\s/g, ""); //Choco Brownie.jpg => ChocoBrownie.jpg
                    data.image = `https://storage.googleapis.com/${process.env.google_storage_bucket}/${fileName}`;
                    data.fname = fileName
                    sharp(fPath)
                      .resize({
                        fit: "fill",
                        width: 500,
                        height: 600,
                      })
                      .toFormat("jpeg")
                      .toFile(resizedImagePath, (err) => {
                        if (!err) {
                          console.log(resizedImagePath);
                          const uploadPromise =
                            fileManager.uploadImageToCloud(resizedImagePath);
                          const addProductPromise =
                            productManager.addProduct(data);

                          Promise.all([uploadPromise, addProductPromise])
                            .then(() => {
                              res.status(200).json({
                                message: "Product added successfully!",
                                success: true,
                              });
                            })
                            .catch((error) => {
                              // Handle error
                              console.error(error);
                              res.status(500).json({
                                message: "Error adding product",
                                success: false,
                              });
                            });
                          fs.unlinkSync(fPath);
                        } else {
                          throw err;
                        }
                      });
                  } catch (err) {
                    console.log(err);
                    res
                      .status(400)
                      .json({ message: "An error occured", success: false });
                  }
                }
              }
            );

            subRoute.get("/:id", jsonParser, async function (req, res) {
              const id = req.params.id;
              if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid id" });
              }
              try {
                const product = await productManager.getProduct(id);
                if (product) res.status(200).json({ data: product });
                else res.status(404).json({ message: "Not found" });
              } catch (err) {
                res.status(404).json({ message: "Not found", notFound: true });
              }
            });

            subRoute.put("/:id", jsonParser, checkIsManager,
              upload.single("image"),
              body("name").isString().optional(),
              body("price").isNumeric().optional(),
              body("category").isString().optional(),
              body("description").isString().optional(), //validation
              body("quantity").isNumeric().optional(),
              body("promotion").isNumeric().optional(),
              async function (req, res) {
                try {
                  const errors = validationResult(req);
                  if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                  } else {
                    const id = req.params.id;
                    if (!mongoose.Types.ObjectId.isValid(id)) {
                      return res.status(400).json({ message: "Invalid id" });
                    }
                    const newData = req.body;

                    if (req.file) {
                      const fPath = req.file.path;
                      const resizedImagePath = path.join(
                        "uploads",
                        "resized",
                        req.file.originalname
                      );
                      const fileName = req.file.originalname.replace(/\s/g, ""); //Choco Brownie.jpg => ChocoBrownie.jpg
                      newData.image = `https://storage.googleapis.com/${process.env.google_storage_bucket}/${fileName}`;
                      sharp(fPath)
                        .resize({
                          fit: "fill",
                          width: 500,
                          height: 600,
                        })
                        .toFormat("jpeg")
                        .toFile(resizedImagePath, async (err) => {
                          if (!err) {
                            await fileManager.uploadImageToCloud(
                              resizedImagePath
                            );
                            fs.unlinkSync(fPath);
                          } else {
                            throw err;
                          }
                        });
                    }
                    if(newData.promotion && (newData.promotion >= 0 && newData.promotion < 1)){
                      //add promotion 
                      await addPromo(newData.promotion, id)
                    }
                    const updateResponse = await productManager.updateProduct(
                      id,
                      newData
                    );
                    if (req.file) await fileManager.deleteImgInCloud(updateResponse.product.fname);
                    res
                      .status(200)
                      .json({
                        message: "Product updated successfully!",
                        products: updateResponse.products,
                        success: true,
                      });
                  }
                } catch (err) {
                  console.log(err.message);
                  res.status(500).json({
                    message: "Something went wrong",
                    success: false,
                  });
                }
              }
            );

            subRoute.post("/sell", jsonParser,
              body("data")
                .exists()
                .withMessage("Data is required")
                .bail()
                .custom((data) => {
                  if (typeof data.table !== "number") {
                    throw new Error("Table should be a string");
                  }

                  if (!Array.isArray(data.items)) {
                    throw new Error("Items should be an array");
                  }

                  for (let item of data.items) {
                    if (typeof item.product !== "string") {
                      throw new Error("Product should be a string");
                    }
                    if (typeof item.amount !== "number" || isNaN(item.amount)) {
                      throw new Error("Amount should be a number");
                    }
                    if (typeof item.price !== "number" || isNaN(item.price)) {
                      throw new Error("Price should be a number");
                    }
                    if (item.note && typeof item.note !== 'string') {
                      throw new Error('Note should be a string when provided');
                    }
                  }

                  if (typeof data.total !== "number" || isNaN(data.total)) {
                    throw new Error("Total should be a number");
                  }

                  if (typeof data.table !== "number" || isNaN(data.table)) {
                    throw new Error("Table should be a number");
                  }

                  // Continue for the rest fields

                  return true;
                }),

              async function (req, res) {
                let order;
                try {
                  const uniqueId = uuidv4();
                  const data = req.body.data;
                  const table = data.table;
                  const recordData = { ...data, uuid: uniqueId };
                  if(!table) return res.status(400).json({ message: `Table doesn't exist`, success: false });
                  console.log(`Order from table: ${table}`);
                  const errors = validationResult(req);
                  if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                  }

                  // Separate functions for selling a product and adding an order
                  order = await productManager.sellProduct(recordData);
                  if (order) {
                    const payUrl = await fetch(
                      `${process.env.STRIPE_SERVER_URL}/stripe/create-checkout-session`,
                      {
                        method: "POST",
                        credentials: "include",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          uuid: uniqueId,
                          order: order,
                        }),
                      }
                    );
                    const dataUrl = await payUrl.json();
                    res.status(200).json({ response: dataUrl, success: true });
                  }
                } catch (err) {
                  console.error(err);
                  if(order){
                    order.deleteOne()
                  }
                  res
                    .status(400)
                    .json({ message: `Error: ${err.message}`, success: false });
                }
              }
            );

            subRoute.post("/cash", jsonParser,
            body("data")
              .exists()
              .withMessage("Data is required")
              .bail()
              .custom((data) => {
                if (typeof data.table !== "number") {
                  throw new Error("Table should be a string");
                }

                if (!Array.isArray(data.items)) {
                  throw new Error("Items should be an array");
                }

                for (let item of data.items) {
                  if (typeof item.product !== "string") {
                    throw new Error("Product should be a string");
                  }
                  if (typeof item.amount !== "number" || isNaN(item.amount)) {
                    throw new Error("Amount should be a number");
                  }
                  if (typeof item.price !== "number" || isNaN(item.price)) {
                    throw new Error("Price should be a number");
                  }
                  if (item.note && typeof item.note !== 'string') {
                    throw new Error('Note should be a string when provided');
                  }
                }

                if (typeof data.total !== "number" || isNaN(data.total)) {
                  throw new Error("Total should be a number");
                }

                if (typeof data.table !== "number" || isNaN(data.table)) {
                  throw new Error("Table should be a number");
                }

                // Continue for the rest fields

                return true;
              }),

            async function (req, res) {
              const data = req.body.data;
              const table = data.table;
              try {
                if(!table) return res.status(400).json({ message: `Table doesn't exist`, success: false });
                const uniqueId = uuidv4();
                const recordId = data.id;
                const recordData = { ...data, uuid: uniqueId };
                console.log(`Order from table: ${table}`);
                const errors = validationResult(req);
                if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
                // Separate functions for selling a product and adding an order
                const order = await productManager.updateOrderTotal(recordId, recordData);
                res.status(200).json({ message: 'Your order has been processed succesfully!', success: true, orderId: order.id });
                
              } catch (err) {
                console.error(err);
                res.status(400).json({ message: `Error: ${err.message}`, success: false, });
              }
            }
          );

            subRoute.delete("/:id", checkIsManager, async function (req, res) {
              const id = req.params.id;
              if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({ message: "Invalid id" });
              }
              try {
                const deleted = await productManager.deleteProduct(id);
                await fileManager.deleteImgInCloud(deleted.fname);
                const products = await productManager.getAllProducts();
                if (deleted)
                  res.status(200).json({message: "Product deleted succesfully!", success: true, 
                  products: products});
                else res.status(400).send("Product does not exist");
              } catch (err) {
                console.error(err);
                res
                  .status(400)
                  .json({
                    message: `An error occurred: ${err.message}`,
                    success: false,
                  });
              }
            });
          });

          subRoute.group("/records", (subRoute) => {
            subRoute.get("/all", checkIsManager, async function (req, res) {
              var recs;
              try {
                recs = await productManager.getRecords();
                recs.sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                res.json({ records: recs });
              } catch (err) {
                console.log(err);
                res
                  .status(400)
                  .json({ message: "Bad request", success: false });
              }
            });

            subRoute.post("/lock/:id", checkIsManager, jsonParser,
              async function (req, res) {
                try {
                  const id = req.params.id;
                  if (!mongoose.isValidObjectId(id)) {
                    return res.status(400).json({ message: "Invalid id" });
                  }
                  const userData = req.body.data;
                  const order = await recordController.getOrder(id, userData);
                  if (order) {
                    socket.emit("refresh", order);
                    res.sendStatus(200);
                  }
                } catch (err) {
                  console.error(err);
                  res
                    .status(400)
                    .json({ message: `An error occurred`, success: false });
                }
              }
            );
            subRoute.get("/:id", jsonParser, async function (req, res) {
              try {
                const id = req.params.id;
                if (!mongoose.isValidObjectId(id)) {
                  return res.status(400).json({ message: "Invalid id" });
                }
                const order = await recordController.findOrder(id);
                res.status(200).json({ order: order, success: true });
              } catch (err) {
                console.error(err);
                res
                  .status(400)
                  .json({ message: `An error occurred`, success: false });
              }
            });
          });

          subRoute.group("/session", checkIsManager, (subSubRoute) => {
            subSubRoute.post("/", jsonParser, async function (req, res) {
              const data = req.body;
              console.log(data);
              const sess = await sessManager.newSession(data);
              if (sess) {
                res.status(200).json({
                  message: "Session closed succesfully!",
                  success: true,
                });
              } else {
                res.status(400).json({
                  message: "Something went wrong",
                  success: false,
                });
              }
            });

            subSubRoute.get("/", async (req, res) => {
              const sess = await sessManager.getSessions();
              res.json({ sessions: sess });
            });

            subSubRoute.get("/today", jsonParser, async (req, res) => {
              let aDate = req.query.date;
              const tod = new Date(aDate).toISOString();
              const sess = await sessManager.getSessionsOfADay(aDate);
              res.json({ sessions: sess });
            });

            subSubRoute.post("/close", jsonParser, async function (req, res) {
              const data = req.body.sessionId;
              const sess = await sessManager.closeSession(data);
              if (sess) {
                res.status(200).json({
                  message: "Session created succesfully!",
                  success: true,
                });
              } else {
                res.status(400).json({
                  message: "Something went wrong",
                  success: false,
                });
              }
            });
          });

          subRoute.group("/room", checkIsManager, (subSubRoute) => {
            subSubRoute.post("/", jsonParser, async function (req, res) {
              const data = req.body;
              const start = data.start;
              const end = data.end;
              const result = await orderer.generateRange(start, end);
              if (result)
                res
                  .status(200)
                  .json({ message: "Rooms added succesfully!", success: true });
              else
                res
                  .status(400)
                  .json({ message: "An error occured", success: false });
            });

            subSubRoute.get("/", jsonParser, async function (req, res) {
              const rooms = await orderer.getRooms();
              res.status(200).send({ rooms: rooms });
            });
          });

          subRoute.group("/activity", (subRoute) => {
            //FlexActivity
            subRoute.get("/", async function (req, res) {
              try {
                const acts = await getfActivities();
                res.status(200).json({ activities: acts, success: true });
              } catch (err) {
                console.error(err);
                res
                  .status(500)
                  .json({ message: "Something went wrong", success: false });
              }
            });
            subRoute.get("/bookings/:id", checkIsManager, async function (req, res) {
              const id = req.params.id;
              if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({ message: "Invalid id" });
              }
              try {
                const bookings = await getBookings();
                res.status(200).json({ bookings: bookings, success: true });
              } catch (err) {
                console.error(err);
                res.status(500)
                   .json({ message: "Something went wrong", success: false });
              }
            });

            //public fetch
            subRoute.get("/check-bookings/:id", async function (req, res) {
              const id = req.params.id;
              if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({ message: "Invalid id" });
              }
              try {
                const bookings = await getBookings();
                res.status(200).json({ bookings: bookings, success: true });
              } catch (err) {
                console.error(err);
                res.status(500)
                   .json({ message: "Something went wrong", success: false });
              }
            });

            subRoute.post("/",jsonParser,checkIsManager,
              upload.single("image"),
              body("name").isString().not().isEmpty(),
              body("description").isString().optional(),
              body("category").isString().not().isEmpty(),
              body("location").isString().optional(),
              body("start").isString().not().isEmpty(),
              body("end").isString().not().isEmpty(),
              validateDurationOptions,
              async (req, res) => {
                try {
                  const errors = validationResult(req);
                  if (!errors.isEmpty()) {
                    console.log(errors)
                    return res
                      .status(400)
                      .json({ message: "Bad request", success: false });
                  }
                  const data = req.body;
                  const fPath = req.file.path;
                  const resizedImagePath = path.join("uploads","resized",req.file.originalname);
                  const fileName = req.file.originalname.replace(/\s/g, ""); //Choco Brownie.jpg => ChocoBrownie.jpg
                  data.image = `https://storage.googleapis.com/${process.env.google_storage_bucket}/${fileName}`;
                  data.fname = fileName
  
                  const durationOptions = JSON.parse(data.durationOptions)
                  data.durationOptions = durationOptions

                  sharp(fPath)
                    .resize({
                      fit: "fill",
                      width: 500,
                      height: 600,
                    })
                    .toFormat("jpeg")
                    .toFile(resizedImagePath, (err) => {
                      if (!err) {
                        //console.log(data)
                        const uploadPromise = fileManager.uploadImageToCloud(resizedImagePath);
                        const addActivityPromise = addActivity(data);
                        Promise.all([uploadPromise, addActivityPromise])
                          .then(() => {
                            res.status(200)
                            .json({ message: "Adding activity successfully!", success: true });
                          })
                          .catch((error) => {
                            console.error(error);
                            res.status(500).json({
                              message: "Error adding activity",
                              success: false,
                            });
                          });
                        fs.unlinkSync(fPath);
                      } else throw err;

                    }); 
                } catch (err) {
                  console.error(err);
                  res
                    .status(400)
                    .json({ message: "Bad request", success: false });
                }
              }
            );

            subRoute.put("/:id", jsonParser, checkIsManager,
              upload.single("image"),
              async (req, res) => {
                try {
                  const id = req.params.id;
                  if (!mongoose.isValidObjectId(id)) {
                    return res.status(400).json({ message: "Invalid id" });
                  }
                  body("title").isString().not().isEmpty();
                  body("description").isString().optional();
                  body("category").isString().not().isEmpty(); //categoryId
                  body("price").isNumeric().not().isEmpty();
                  body("location").isString().not().isEmpty();
                  body("duration").isNumeric().optional();
                  body("date").isDate().optional();
                  body("start").isDate().optional();
                  const errors = validationResult(req);
                  if (!errors.isEmpty()) {
                    return res
                      .status(400)
                      .json({ message: "Bad request", success: false });
                  }
                  const data = req.body;
                  if (req.file) {
                    const fPath = req.file.path;
                    const resizedImagePath = path.join(
                      "uploads",
                      "resized",
                      req.file.originalname
                    );
                    const fileName = req.file.originalname.replace(/\s/g, ""); //Choco Brownie.jpg => ChocoBrownie.jpg
                    data.image = `https://storage.googleapis.com/${process.env.google_storage_bucket}/${fileName}`;
                    data.fname = fileName

                    sharp(fPath)
                      .resize({
                        fit: "fill",
                        width: 500,
                        height: 600,
                      })
                      .toFormat("jpeg")
                      .toFile(resizedImagePath, async (err) => {
                        if (!err) {
                          await fileManager.uploadImageToCloud(resizedImagePath);
                          fs.unlinkSync(fPath);
                        } else throw err;
                      });
                  }

                  const durationOptions = JSON.parse(data.durationOptions)
                  data.durationOptions = durationOptions
                  const updated = await updatefActivity(id, data);
                  if (req.file) await fileManager.deleteImgInCloud(updated.fname);

                  res
                    .status(200)
                    .json({
                      message: "Acitvity updated successfully!",
                      success: true,
                    });
                } catch (err) {
                  console.log(err);
                  res.status(500).json({
                    message: "Something went wrong",
                    success: false,
                  });
                }
              }
            );

            subRoute.delete("/:id", checkIsManager,
              async function (req, res) {
                try {
                  const id = req.params.id;
                  if (!mongoose.isValidObjectId(id)) {
                    return res.status(400).json({ message: "Invalid id" });
                  }
                  const deleted = await deletefActivity(id);
                  if (deleted){
                    await fileManager.deleteImgInCloud(deleted.fname);
                    res.status(200).send("Acitvity deleted succesfully!");
                  }
                  else res.status(400).send("Acitvity does not exist");
                } catch (err) {
                  console.error(err);
                  res
                    .status(400)
                    .json({
                      message: `An error occurred: ${err.message}`,
                      success: false,
                    });
                }
              }
            );
          });

          subRoute.group("/view", (subSubRoute) => {
            subSubRoute.post(
              "/",
              checkIsManager,
              jsonParser,
              async function (req, res) {
                try {
                  const view = req.body.view;
                  //console.log("got view: " +  view)
                  await addView(view);
                  this.selectedView = view;
                  res
                    .status(200)
                    .json({
                      message: "View added succesfully!",
                      success: true,
                    });
                } catch (err) {
                  console.log(err);
                  res
                    .status(500)
                    .json({ message: "An error occured", success: false });
                }
              }.bind(this)
            );

            subSubRoute.get("/", jsonParser, async (req, res) => {
              try {
                const view = req.body.view;
                let aView = this.selectedView;
                if (!aView) aView = await getView(view);
                res.status(200).json({ view: aView, success: true });
              } catch (err) {
                res
                  .status(500)
                  .json({ message: "An error occured", success: false });
              }
            });
          });
        }
      );
    });
    return aRouter;
  }
}

module.exports = {
  RouterHandler,
};
