const express = require('express');
const productCategories = require('./routes/productCategories');
const products = require('./routes/products');
const bodyParser = require('body-parser');
const cors = require('cors');
const user = require('./routes/user');
const checkout = require('./routes/checkout');
const orders = require('./routes/orders');
const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = 5001;
app.use('/productCategories', productCategories);
app.use('/products', products);
app.use('/users', user);
app.use('/orders', orders);
app.use('/checkout', checkout);
const server = app.listen(port, () => {
  console.log('E-commerce server is running on port 5001');
});