const router = require("express").Router();
const cartController = require("../controllers/cartController");

//End-Points
router.get("/find/:id", cartController.getCart);
router.post("/", cartController.addTocart);
router.post("/quantity", cartController.decrementCartItem);
router.delete("/:cartItemId", cartController.deleteCartItem);


module.exports = router;
