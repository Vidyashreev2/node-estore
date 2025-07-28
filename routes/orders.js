const express = require("express");
const pool = require("../db");
const orders = express.Router();
const checkToken = require("./shared/checkToken");

orders.post("/add", checkToken, async (req, res) => {
  const { userName, email, city, state, address, pin, total, orderDetails } =
    req.body;
  try {
    const user = await pool.query("select * from users where email=$1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const userId = user.rows[0].id;
    const order = await pool.query(
      "INSERT INTO orders (userId, username, city, state, address, pin, total) VALUES ($1, $2, $3, $4,$5,$6,$7)  RETURNING orderId",
      [userId, userName, city, state, address, pin, total]
    );
    console.log(order);
    const { orderid } = order.rows[0];
    const orderDetailsArray = orderDetails.map((item) => {
      return pool.query(
        "insert into orderDetails(orderId, productId,qty, price, amount) values($1,$2,$3,$4,$5) ",
        [orderid, item.productId, item.qty, item.price, item.amount]
      );
    });
    await Promise.all(orderDetailsArray);
    res.status(201).json({ message: "Order Placed" });
  } catch (err) {
    console.log("order Placement Error", err);
    res.status(500).json({
      error: err.code || "Internal error",
      message: err.message || "Something went wrong",
    });
  }
});

orders.get("/allorders", checkToken, async (req, res) => {
  const { email } = req.query;
  try {
    const user = await pool.query("select * from users where email=$1", [email]);
    if (!user.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = user.rows[0].id;
    const orders = await pool.query(
      "SELECT orderId,  TO_CHAR(orderDate, 'MMDDYY') AS orderDate,username, city,state, address,pin,total  FROM orders WHERE userId=$1",
      [userId]
    );
    const allOrders = orders.rows.map((data) => ({
      orderId: data.orderid,
      orderDate: data.orderdate,
      username: data.username,
    city: data.city,
    state: data.state,
    address: data.address,
    pin: data.pin,
    total:data.total
    }));
    return res.status(200).json(allOrders);
  } catch (err) {
    console.log("Fetch all orders Error", err);
    res.status(500).json({
      error: err.code || "Internal error",
      message: err.message || "Something went wrong",
    });
  }
});

orders.get("/orderproducts", checkToken, async (req, res) => {
  const { orderId } = req.query;
  try {
    const orderDetails = await pool.query(
      "select ord.productId,p.product_name, ord.qty,ord.price,p.product_img, ord.amount from orderDetails ord join products p on ord.productId=p.id where ord.orderId=$1",
      [orderId]
    );
    console.log(orderDetails)
    const orderProducts = orderDetails.rows.map((item) => ({
      productId: item.productId,
      productName: item.product_name,
      productImage: item.product_img,
      qty:item.qty,
      price:item.price,
      amount:item.amount,
    }));
    res.status(200).json(orderProducts);
  } catch (err) {
    console.log("Fetch all orders Error", err);
    res.status(500).json({
      error: err.code || "Internal error",
      message: err.message || "Something went wrong",
    });
  }
});
module.exports = orders;
