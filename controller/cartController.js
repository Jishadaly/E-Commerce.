const session = require('express-session');
const cartSchema = require('../model/cartModel');
// const { userModel: User , productModel:Product , categories, productModel} = require('../model/dataBaseModel');
const Product = require('../model/productModal')
// const mongoose = require('mongoose');
const { subscribe } = require('../routes/userRoute');






const addToCart = async (req, res) => {
  try {
    const productId = req.query.id;
    const userId = req.session.userId;

    let userCart = await cartSchema.findOne({ user: userId }).populate('products.product');

    if (!userCart) {
      userCart = new cartSchema({ user: userId, products: [] });
    }

    const existingProduct = userCart.products.find((item) => {
      return item.product._id.toString() === productId;
    });

    if (existingProduct) {
      console.log('Existing product found');
      existingProduct.quantity += 1;
      existingProduct.subTotal = existingProduct.product.discountPrice * existingProduct.quantity;
    } else {

      const product = await Product.findById(productId);

      if (product) {
        userCart.products.push({ product: productId, quantity: 1, subTotal: product.discountPrice });
        const total = userCart.products.reduce((acc, curr) => acc + (curr.subTotal || 0), 0);
        userCart.Total = total;
      } else {
        console.log('Product not found');
      }
    }

    await userCart.save();
    res.redirect('/cartPage');

  } catch (error) {
    console.log(error);

  }
};




async function loadCart(req, res) {
  try {
    const user = req.session.userId;
    const cart = await cartSchema.findOne({ user: user }).populate('user').populate('products.product')

    res.render('cart', { cart ,user})
  } catch (error) {
    console.log(error);
  }
}




async function updateSubTotal(req, res) {
  try {
    const { productId, quantity, } = req.body;
    console.log(`porduct id : ${productId} quantity : ${quantity}`);
    const userId = req.session.userId;




    const cart = await cartSchema.findOne({ user: userId }).populate('products.product');
    const filterdProduct = cart.products.find((value) => { return productId == value.product._id.toString() })

    if (filterdProduct) {

      if (quantity > filterdProduct.quantity) {

        filterdProduct.quantity = quantity;
        const subtotal = filterdProduct.product.discountPrice * quantity;
        filterdProduct.subTotal = subtotal;

      } else {

        filterdProduct.quantity = quantity;
        const subtotal = filterdProduct.subTotal - filterdProduct.product.discountPrice;
        filterdProduct.subTotal = subtotal;

      }

      const total = cart.products.reduce((acc, curr) => acc + (curr.subTotal || 0), 0);
      cart.Total = total;
      await cart.save();
      res.status(200).json({ message: "success" });

    } else {
      console.log("product not found in the cart or product details are missing");
    }

  } catch (error) {
    console.log(error);
  }
}


async function removeProduct(req, res) {
  try {

    const productId = req.query.id;
    const user = req.session.userId;

    const cart = await cartSchema.findOne({ user: user });

    if (cart) {

      const productIndex = cart.products.findIndex((item) =>
        item.product.toString() == productId
      );

      const removedProduct = cart.products[productIndex];
      console.log(removeProduct);
      const removedSubTotal = removedProduct.subTotal;
      console.log(removedSubTotal);
      cart.products.splice(productIndex, 1);

      cart.Total = cart.Total - removedSubTotal;

      await cart.save()

      res.redirect('/cartPage');

    }
  } catch (error) {
    console.log(error);
  }
}





module.exports = {
  addToCart,
  loadCart,
  removeProduct,
  updateSubTotal
};

