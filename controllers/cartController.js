const Product = require("../models/Products");
const Cart = require("../models/Cart");

module.exports = {
  //ADD TO CART
  addTocart: async (req, res) => {
    const { userId, cartItem, quantity } = req.body;
    try {
      const cart = await Cart.findOne({ userId });
      if (cart) {
        const existingProducts = cart.products.find(
          (product) => product.cartItem.toString() === cartItem
        );

        if (existingProducts) {
          existingProducts.quantity += 1;
        } else {
          cart.products.push({ cartItem, quantity });
        }

        //Save to Database
        await cart.save();
        res.status(200).json("Product added to Cart");
      } else {
        const newCart = new Cart({
          userId,
          products: [{ cartItem, quantity: quantity }],
        });

        //Save to Database
        await newCart.save();
        res.status(200).json("Product added to Cart");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },

  //GET CART
  getCart: async (req, res) => {
    const userId = req.params.id;
    try {
      const cart = await Cart.find({ userId }).populate(
        "products.cartItem",
        "_id title supplier price imageUrl"
      );
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  //DELETE CART
  deleteCartItem: async (req, res) => {
    const cartItemId = req.params.cartItemId;
    try {
      const updatedCart = await Cart.findOneAndUpdate(
        { "products._id": cartItemId },
        { $pull: { products: { _id: cartItemId } } },
        { new: true }
      );

      if (!updatedCart) {
        return res.status(404).json("Cart Item  not Found");
      }

      res.status(200).json(updatedCart);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  //DECREMENT CART
  //   decrementCartItem: async (req, res) => {
  //     const { userId, cartItem } = req.body;

  //     try {
  //       const cart = Cart.findOne({ userId });

  //       if (!cart) {
  //         return res.status(404).json("Cart not found");
  //       }
  //       const existingProduct = cart.products.find(
  //         (product) => product.cartItem.toString() === cartItem
  //       );

  //       if (!existingProduct) {
  //         return res.status(404).json("Product not found");
  //       }

  //       if (existingProduct.quantity === 1) {
  //         cart.products = cart.products.filter(
  //           (product) => product.cartItem.toString() !== cartItem
  //         );
  //       } else {
  //         existingProduct.quantity -= 1;
  //       }

  //       await cart.save();

  //       if (existingProduct === 0) {
  //         await Cart.updateOne({ userId }, { $pull: { products: { cartItem } } });
  //       }

  //       res.status(200).json("Product Updated");
  //     } catch (error) {
  //       res.status(500).json(error);
  //     }
  //   },

  // DECREMENT CART
  decrementCartItem: async (req, res) => {
    const { userId, cartItem } = req.body;

    try {
      const cart = await Cart.findOne({ userId }).exec();

      if (!cart) {
        return res.status(404).json("Cart not found");
      }

      const existingProduct = cart.products.find(
        (product) => product.cartItem.toString() === cartItem
      );

      if (!existingProduct) {
        return res.status(404).json("Product not found");
      }

      if (existingProduct.quantity === 1) {
        cart.products = cart.products.filter(
          (product) => product.cartItem.toString() !== cartItem
        );
      } else {
        existingProduct.quantity -= 1;
      }

      await cart.save();

      if (existingProduct.quantity === 0) {
        await Cart.updateOne({ userId }, { $pull: { products: { cartItem } } });
      }

      res.status(200).json("Product Updated");
    } catch (error) {
      console.error(error);
      res.status(500).json("Internal Server Error");
    }
  },
};
