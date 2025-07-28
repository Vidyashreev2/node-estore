const express = require('express');
const pool = require('../db');
const products = express.Router();


products.get('/',async (req, res) => {
  try {
    const mainCategoryId= req.query.mainCategoryId;
    const subCategoryId = req.query.subCategoryId;
    const keyword = req.query.keyword;
    let query = 'SELECT * FROM products';
    let queryParams =[]
    if(mainCategoryId){
      query = ' SELECT * FROM products join categories on products.category_id = categories.id where categories.parent_category_id=$1';
      queryParams.push(+mainCategoryId);
        if(keyword){
      query +=` and keywords ILIKE '%${keyword}%'`;
    }
    } else if(subCategoryId){
      query= 'SELECT * FROM products where category_id =$1';
      queryParams.push(+subCategoryId);
    }
  
    const result = await pool.query(query,queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error('Error querying DB:', err);
    res.status(500).send({error: error.code, message:'Internal Server Error'});
  }
});

products.get('/:id', async(req,res)=>{
  const id = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).send({ message: 'Product not found' });
    } else {
      res.status(200).json(result.rows[0]);
    }

  } catch (error) {
    console.error('DB error:', error);
    res.status(500).send(error);
  }
})

module.exports = products;