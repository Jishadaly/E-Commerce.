const { model, default: mongoose } = require('mongoose');
// const { productModel, categories: category} = require('../model/dataBaseModel');
const productModel = require('../model/productModal')
const category = require('../model/categoryModal')
const orderModel = require('../model/orderModel');
const categoryModal = require('../model/categoryModal');
const fs = require('fs');
const path = require('path');


async function addProductLoad(req, res) {
  try {
    const categories = await category.find();
    console.log(categories);
    res.render('addProduct', { categories })
  } catch (error) {
    console.log(error);
  }
}



async function addProduct(req, res) {
  try {


    console.log(req.body);

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
      featured: req.body.featurdStatus,
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



async function loadProductList(req, res) {
  try {

    const page = parseInt(req.query.page, 10) || 1;
    const productsPerPage = 4;

    const totalCount = await productModel.countDocuments();
    const totalPages = Math.ceil(totalCount / productsPerPage);
    const skip = (page - 1) * productsPerPage;

    const datas = await productModel.find()
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(productsPerPage);

    res.render('productList', {
      datas,
      currentPage: page,
      totalPages: totalPages
    })

  } catch (error) {
    console.log(error.message);
  }
}



async function listUnlist(req, res) {
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


async function loadEditProduct(req, res) {
  try {

    const id = req.params.id;
    const data = await productModel.findById(id);

    const cat = await category.find();

    res.render('editProduct', { data, cat });
  } catch (error) {
    console.log(error.message);
  }
}



// async function editProduct(req, res) {
//   try {

//     // const id = model.Types.ObjectId(req.params.id);
//     const id = req.params.id;
//     console.log(id);
//     const newId = new mongoose.Types.ObjectId(id);

//     const datas = await productModel.findById(id)

//     const data = {

//       name: req.body.ProductName,
//       brand: req.body.brandName,
//       quantity: req.body.quantity,
//       model: req.body.Model,
//       ram: req.body.ram,
//       rom: req.body.rom,
//       processor: req.body.processor,
//       description: req.body.description,
//       discountPrice: req.body.discountPrice,
//       featured:req.body.featurdStatus,
//       category: req.body.category,
//       productImages: req.files.map((file) => file.filename)

//     }



//     console.log(datas);
//     const updateData = await productModel.findByIdAndUpdate(newId, data);
//     if (updateData) {

//       console.log("data updated");
//     }

//     res.redirect('/admin/productList');

//     //  const updateData =  await productModel.findById(newId);
//     // console.log(updateData);

//   } catch (error) {
//     console.log(error);
//   }
// }


async function editProduct(req, res) {
  try {
    const id = req.params.id;
    console.log(id);
    const newId = new mongoose.Types.ObjectId(id);

    const datas = await productModel.findById(id);

    const data = {
      name: req.body.ProductName,
      brand: req.body.brandName,
      quantity: req.body.quantity,
      model: req.body.Model,
      ram: req.body.ram,
      rom: req.body.rom,
      processor: req.body.processor,
      description: req.body.description,
      discountPrice: req.body.discountPrice,
      featured: req.body.featurdStatus,
      category: req.body.category,
    };


    if (req.files && req.files.length > 0) {
      data.productImages = req.files.map((file) => file.filename);
    }

    console.log(datas);
    const updateData = await productModel.findByIdAndUpdate(newId, data);
    if (updateData) {
      console.log("data updated");
    }

    res.redirect('/admin/productList');
  } catch (error) {
    console.log(error);
  }
}




//user side product 

async function loadProductDetails(req, res) {
  try {


    const id = req.query.id;

    console.log("prodect id /////" + id);
    const productDetails = await productModel.findById(id);
    const productCat = await category.find();
    const favProduct = await productModel.find({ list: true });
    res.render('productDetails', { productDetails, productCat, favProduct })

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






// async function loadProducts(req, res) {

//   try {

//     const brands = await productModel.distinct('brand');
//     const categories = await category.find();
//     const user = req.session.userId;
//     const searchQuery = req.query.searchedData;
//     const filter = {};

//     console.log(req.body);
//     console.log(searchQuery);

//     const page = parseInt(req.query.page, 10) || 1;
//     const productsPerPage = 4;

//     if (searchQuery) {

//       filter['$and'] = [
//         {
//           $or: [
//             { name: { $regex: new RegExp(searchQuery, 'i') } },
//             { brand: { $regex: new RegExp(searchQuery, 'i') } },
//           ],
//         },
//         { list: true },
//       ];
//     } else {
//       filter['list'] = true;
//     }


//     const query = filter['$and'] ? { $and: filter['$and'] } : filter;




//   const results = await Promise.all([
//     productModel
//       .find(query)
//       .skip((page - 1) * productsPerPage)
//       .limit(productsPerPage)
//       .exec(),
//       productModel.countDocuments(query).exec(),
//   ]);

//     const [products, totalProducts] = results;


//     res.render('products',{
//       products,
//       categories,
//       brands,
//       currentPage: page,
//       totalPages: Math.ceil(totalProducts / productsPerPage),
//       user,
//     });



//   } catch (error) {
//     console.error(error.message);

//   }
// }




async function loadProducts(req, res) {
  try {
    const brands = await productModel.distinct('brand');
    const categories = await category.find();
    const user = req.session.userId;
    const searchQuery = req.query.searchedData;
    const { sortby, categories: selectedCategories } = req.body; // Retrieve sort and categories from form data
    const filter = {};

    console.log(req.body);
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

    // Apply category filtering if selected
    if (selectedCategories && selectedCategories.length > 0) {
      filter['$and'] = filter['$and'] || [];
      filter['$and'].push({ category: { $in: selectedCategories } });
    }

    const query = filter['$and'] ? { $and: filter['$and'] } : filter;

    let sortCriteria = {};

    // Apply sorting based on sort criteria
    if (sortby === 'low-to-high') {
      sortCriteria = { price: 1 }; // Sort by price low to high
    } else if (sortby === 'high-to-low') {
      sortCriteria = { price: -1 }; // Sort by price high to low
    }

    const results = await Promise.all([
      productModel
        .find(query)
        .sort(sortCriteria)
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







async function deleteImage(req, res) {
  try {

    console.log('////////////////////////');
    console.log(req.body);
    const { image, index, productId } = req.body;
    const product = await productModel.findById(productId);
    if (product) {
      product.productImages.splice(index,1);
      await product.save();
      res.status(200).json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ error:'Product not found'});
    }
   
     
    
   
    


  } catch (error) {
    console.log();

  }
}

module.exports = deleteImage;

module.exports = deleteImage;




module.exports = {
  addProductLoad, loadProductList, addProduct, listUnlist,
  loadEditProduct, editProduct, loadProductDetails,
  loadProducts, deleteImage,
  // filterProduct

}


