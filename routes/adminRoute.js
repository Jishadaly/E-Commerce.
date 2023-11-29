
const express = require ("express");
const adminRoute = express();
const adminController = require('../controller/adminController');
const category = require('../controller/categoryController');
const product = require ('../controller/productController')
const upload = require('../helper/multer');
const isLogin = require('../middleware/admin_authHandler');
adminRoute.set('view engine','ejs')
adminRoute.set('views','./view/admin');






adminRoute.use(express.urlencoded({ extended: true }));
adminRoute.use(express.json());

//calling the API
adminRoute.get('/',adminController.loadLogin);
adminRoute.post('/',adminController.verifyLogin);
adminRoute.get('/dashboard',isLogin,adminController.loadDashboard);
adminRoute.get('/users',isLogin,adminController.loadUserlist);
adminRoute.get('/blockUser',adminController.blockUser);
adminRoute.get('/category',category.loadCategory);
adminRoute.get('/addCategory',category.loadAddCategory);
adminRoute.post('/addCategory',upload.single('image'),category.addCategory);
adminRoute.get('/listingCat',category.listingCategory);
adminRoute.get('/editCategory', category.loadEditCategory);
adminRoute.post('/editCategory/:id',upload.single('image'),category.updateCategory);
adminRoute.get('/addProduct',product.addProductLoad);
adminRoute.post('/addProduct',upload.array('productImages',4),product.addProduct)
adminRoute.get('/productList',product.loadProductList);
adminRoute.get('/productList/:id',product.listUnlist);
adminRoute.get('/editProduct/:id',product.loadEditProduct);
adminRoute.post('/editProduct/:id',upload.array('productImages',4),product.editProduct);
adminRoute.get('/orderList',product.loadOrderList)
adminRoute.get('/orderDetails',product.loadOrderDetails);
adminRoute.post('/ChangeOrderStatus',product.orderStatus);


module.exports = adminRoute;
