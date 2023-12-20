
const express = require ("express");
const adminRoute = express();
const adminController = require('../controller/adminController');
const category = require('../controller/categoryController');
const product = require ('../controller/productController')
const orderController = require('../controller/orderController')
const upload = require('../helper/multer');
const isLogin = require('../middleware/admin_authHandler');
const report = require('../controller/reportController')
const excelController = require('../controller/excelController');

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
adminRoute.get('/category',isLogin,category.loadCategory);
adminRoute.get('/addCategory',category.loadAddCategory);
adminRoute.post('/addCategory',upload.single('image'),category.addCategory);
adminRoute.get('/listingCat',isLogin,category.listingCategory);
adminRoute.get('/editCategory', category.loadEditCategory);
adminRoute.post('/editCategory',upload.single('image'),category.updateCategory);
adminRoute.get('/addProduct',product.addProductLoad);
adminRoute.post('/addProduct',upload.array('productImages',4),product.addProduct)
adminRoute.get('/productList',isLogin,product.loadProductList);
adminRoute.get('/productList/:id',product.listUnlist);
adminRoute.get('/editProduct/:id',isLogin,product.loadEditProduct);
adminRoute.post('/editProduct/:id',upload.array('productImages',4),product.editProduct);
adminRoute.get('/orderList',isLogin,orderController.loadOrderList)
adminRoute.get('/orderDetails',isLogin,orderController.loadOrderDetails);
adminRoute.post('/ChangeOrderStatus',orderController.orderStatus);
adminRoute.post('/deleteImage',product.deleteImage)
adminRoute.post('/returnRequest',orderController.returnRequest);
adminRoute.get('/returnOrderList',orderController.loadReturnOrderList)
adminRoute.get('/returnOrder_Details',isLogin,orderController.loadReturnOrderDetails)
adminRoute.post('/returnResponse',orderController.returnResponse);
adminRoute.get('/createCoupon',isLogin,adminController.loadAddCoupon);
adminRoute.post('/createCoupon',adminController.addCoupon);
adminRoute.get('/listCoupon',adminController.couponList);
adminRoute.get('/editCoupon',isLogin,adminController.loadEdiCoupon);
adminRoute.post('/editCoupon',adminController.ediCoupon);
adminRoute.get('/deleteCoupon',adminController.deleteCoupon);
adminRoute.get('/couponlistAndUnlist/:id',adminController.couponlistAndUnlist)
adminRoute.get('/salesReports',isLogin,report.loadReportPage);
adminRoute.get('/monthly-revenue',report.monthlyRevenue)
adminRoute.get('/weekly-revenue',report.weeklyRevenue)
adminRoute.get('/yearly-revenue',report.yearlyRevenue)
adminRoute.get('/monthly-sales-count',report.monthlySales)
adminRoute.get('/weekly-sales-count', report.weeklySales);
adminRoute.get('/yearly-sales-count', report.yearlySales);
adminRoute.get('/user-counts',report.userCounts)
adminRoute.post('/getSalesReport',report.getSalesReport);
adminRoute.get('/sales-Report-excel',excelController.getExcelSalesReport)


module.exports = adminRoute;