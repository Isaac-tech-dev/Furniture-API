const router = require("express").Router();
const orderController = require("../controllers/orderController");

//END-POINTS
router.get("/:id", orderController.getUserOrders);

module.exports = router;
