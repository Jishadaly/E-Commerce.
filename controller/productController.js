const { model, default: mongoose } = require('mongoose');
// const { productModel, categories: category} = require('../model/dataBaseModel');
const productModel = require('../model/productModal')
const category = require('../model/categoryModal')
const orderModel = require('../model/orderModel');
const categoryModal = require('../model/categoryModal');


 async function addProductLoad (req,res){
        try {
          const categories  = await category.find();
          console.log(categories);
          res.render('addProduct',{categories})
        } catch (error) {
          console.log(error);
        }
 }



  async function addProduct(req, res) {
    try {
      console.log(req.files);
  
      
      const featured = req.body.refundable === 'on'; // Assuming 'on' is the value when checkbox is checked
  
      const data = {
        name: req.body.ProductName,
        brand: req.body.brandName,
        quantity: req.body.quantity,
        model: req.body.modelName,
        ram: req.body.ram,
        rom: req.body.rom,
        processor: req.body.processor,
        description: req.body.description,
        price: req.body.price,
        discountPrice: req.body.discountPrice,
        category: req.body.category,
        featured: featured, 
        productImages: req.files.map((file) => file.filename)
      };
  
      console.log(data);
      console.log(data.category);
  
      const DBdata = await productModel.insertMany(data);
      console.log("data inserted successfully");
      res.redirect('/admin/productList');
      console.log(DBdata);
    } catch (error) {
      console.log(error);
    }
  }
  

 async function loadProductList(req,res){
  try {

      const page = parseInt(req.query.page, 10) || 1;
      const productsPerPage = 4; 
      
      const totalCount =  await productModel.countDocuments();
      const totalPages = Math.ceil(totalCount/productsPerPage);
      const skip = (page - 1) * productsPerPage;

      const datas = await productModel.find()
      .sort({orderDate:-1})
      .skip(skip)
      .limit(productsPerPage);

      res.render('productList',{
        datas,
        currentPage:page,
        totalPages:totalPages
      })
      
  } catch (error) {
    console.log(error.message);
  }
 }



 
 async function listUnlist(req,res){
  try {
      const id = req.params.id;
      console.log(id);
      if (id) {
        const data = await productModel.findById(id);
        console.log(data);
        data.list = !data.list;
        await data.save();
        
        res.redirect('/admin/productList');

      } else {
        res.redirect('/admin/productList');
        console.log("no chang btw list unlist");
      }
     

  } catch (error) {
    console.log(error);
  }
 }
 

 async function loadEditProduct(req,res){
    try {

       const id=  req.params.id;
       const data = await productModel.findById(id);
       
       const cat =await category.find();
      
       res.render('editProduct',{data,cat}); 
      } catch (error) {
      console.log(error.message);
    }
 }



async function editProduct(req,res){
  try {
    
    // const id = model.Types.ObjectId(req.params.id);
    const id = req.params.id;
    console.log(id);
    const newId=new mongoose.Types.ObjectId(id);
    
    const datas = await productModel.findById(id)

    const data = {

      name : req.body.ProductName,
      brand: req.body.brandName,
      quantity:req.body.quantity,
      model:req.body.Model,
      ram:req.body.ram,
      rom:req.body.rom,
      processor:req.body.processor,
      description:req.body.description,
      discountPrice:req.body.discountPrice,
      category:req.body.category,
      productImages:req.files.map((file) =>file.filename) 
  
  }

  

     console.log(datas);
    const updateData= await productModel.findByIdAndUpdate(newId,data);
    if(updateData){
      
    console.log("data updated");
    }

    res.redirect('/admin/productList');

  //  const updateData =  await productModel.findById(newId);
    // console.log(updateData);

  } catch (error) {
    console.log(error);
  }
}



//user side product 

async function loadProductDetails (req,res){
  try {

  
    const id = req.query.id;
    
    console.log("prodect id /////"+id);
    const productDetails = await productModel.findById(id);
    const productCat = await category.find();
    const favProduct = await productModel.find({list:true});
    res.render('productDetails',{ productDetails , productCat, favProduct })

  } catch (error) {
    console.log(error);
  }
}


// async function loadOrderList(req,res){
//   try {
    
//     const orderData =  await orderModel.find().populate('address').sort({createdAt:-1})
//      res.render('orderList',{orderData})
//   } catch (error) {
//     console.log(error);
//   }
// }



// async function loadOrderDetails(req,res){
//   try {

//      const orderId = req.query.orderId;
//      console.log(orderId);
//      const orderDetails = await orderModel.findById(orderId).populate('address').populate('products.product')
//      res.render('orderDetails',{ orderDetails })
//   } catch (error) {
//     console.log(error);
//   }
// }





async function loadProducts(req, res) {

  try {

    const brands = await productModel.distinct('brand');
    const categories = await category.find();
    const user = req.session.userId;
    const searchQuery = req.query.searchedData;
    const filter = {};
    

    console.log(searchQuery);

    const page = parseInt(req.query.page, 10) || 1;
    const productsPerPage = 4; 
    if (searchQuery) {
      
      filter['$and'] = [
        {
          $or: [
            { name: { $regex: new RegExp(searchQuery, 'i') } },
            { brand: { $regex: new RegExp(searchQuery, 'i') } },
          ],
        },
        { list: true }, 
      ];
    } else {
      filter['list'] = true; 
    }

    
    const query = filter['$and'] ? { $and: filter['$and'] } : filter;
    let sortCriteria = {}; // Initialize sorting criteria

    // Check if sort query parameter exists and set the sorting criteria
    const sortQuery = req.body.sort;
    if (sortQuery === 'priceLowToHigh') {
      sortCriteria['price'] = 1; // Sort by price in ascending order
    }
    
    const results = await Promise.all([
      productModel
        .find(query)
        .skip((page - 1) * productsPerPage)
        .limit(productsPerPage)
        .exec(),
      productModel.countDocuments(query).exec(),
    ]);

    const [products, totalProducts] = results;

    
    res.render('products', {
      products,
      categories,
      brands,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / productsPerPage),
      user,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
}







// async function orderStatus(req,res){
//   try {
//     console.log("inside::::::::orderstatus");
//       const {orderId,status } = req.body;
  
//       console.log('orderID::::'+orderId);
//       console.log("status "+ status);
//       // console.log(status,orderId);
//       if (!status || !orderId) {
//           return res.status(400).json({ error: 'Invalid input parameters' });
//       }
//       const updatedOrder = await orderModel.findByIdAndUpdate(
//         { _id: orderId},
//         { $set: { status: status } },
//         { new: true }
//     );
//       console.log(updatedOrder);
//       if (!updatedOrder) {
//           return res.status(404).json({ error: 'Order not found' });
//       }
//       res.json({ success: true });
//   } catch (error) {
//       console.error('Error updating order status:', error);
//       res.status(500).json({ error: 'Internal server error' });
//   }

// }


async function deleteImage(req,res){
  try {
    const { filename } = req.body;
    console.log("Received filename:", filename);
          console.log("////////////////////////"+image);
      } catch (error) {
    console.log(error);
  }
}


// async function filterProduct(req, res) {
//   try {
//       console.log("Received request body:");
      
//       const category = req.body.category;
//       const pricesort = req.body.sortOrder;
//       console.log(pricesort);
//       console.log(category);
      
//       const foundCategory = await categoryModal.findOne({ category: category });
      
//       console.log(foundCategory);
//       if(category){
//         const productsInCategory = await productModel.find({ category: foundCategory._id }).populate('category');
//         console.log(productsInCategory);
        
//       }
//   } catch (error) {
//       console.error(error);
//   }
// }



 module.exports = { addProductLoad ,loadProductList, addProduct , listUnlist , 
                   loadEditProduct , editProduct , loadProductDetails, 
                  //  loadOrderList,
                  //  loadOrderDetails 
                    loadProducts, deleteImage,
                    // filterProduct
                  //  orderStatus
}


