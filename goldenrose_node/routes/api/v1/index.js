const express = require("express");
const app = express();

//Admin Controllers

app.use("/admin", require("./controllers/admin/authController"));
app.use("/admin/dashboard", require("./controllers/admin/dashboardController"));
app.use("/admin/user", require("./controllers/admin/userController"));
app.use("/admin/coupon", require("./controllers/admin/couponController"));
app.use("/admin/notification", require("./controllers/admin/notificationController"));
app.use("/admin/category", require("./controllers/admin/categoryController"));
app.use("/admin/type", require("./controllers/admin/typeController"));
app.use("/admin/subtype", require("./controllers/admin/subtypeController"));
app.use("/admin/product", require("./controllers/admin/productController"));
app.use("/admin/order", require("./controllers/admin/orderController"));
app.use("/admin/settings", require("./controllers/admin/settingsController"));
app.use("/admin/locale", require("./controllers/admin/localeController"));

//User Controllers
app.use("/auth/user", require("./controllers/user/authController"));
app.use("/user", require("./controllers/user/userController"));
app.use("/user/card", require("./controllers/user/cardController"));
app.use("/user/wishlist", require("./controllers/user/wishlistController"));
app.use("/user/category", require("./controllers/user/categoryController"));
app.use("/user/product", require("./controllers/user/productController"));
app.use("/user/cart", require("./controllers/user/cartController"));
app.use("/user/order", require("./controllers/user/orderController"));

//Guest Controllers
app.use("/guest/cart", require("./controllers/guest/cartController"));
app.use("/guest/order", require("./controllers/guest/orderController"));


module.exports = app;
