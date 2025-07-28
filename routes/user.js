const express = require("express");
const pool = require("../db");
const bcrypt = require("bcryptjs");
const user = express.Router();
const jwt = require("jsonwebtoken");

user.post("/signup", async (req, res) => {
  const { firstName, lastName, address, city, state, pin, email, password } =
    req.body;
  try {
    const existingUser = await pool.query(
      "select * from users where email =$1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(200).send({ message: "user already present" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "insert into users(email, password, address, city, state,first_name,last_name,pin) values($1,$2,$3,$4,$5,$6,$7,$8)",
      [email, hashedPassword, address, city, state, firstName, lastName, pin]
    );
    return res.status(200).send({ message: "user created successfully" });
  } catch (error) {
    return res
      .status(500)
      .send({ error: error.code || "internal error", message: error.message });
  }
});

user.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email)
  try {
    const user = await pool.query("select * from users where email=$1", [email]);
    if (!user.rows.length) {
      return res.status(404).send({ message: "user does not exists" });
    }
    const passwordMatch =  await bcrypt.compare(password, user.rows[0].password);
    if (!passwordMatch) {
      return res.status(401).send({ message: "invalid password" });
    }
    const token = jwt.sign({id:user.rows[0].id, email:user.rows[0].email},"estore-secret-key",{expiresIn:"1h"});
    return res.status(200).send({token, expiresInSeconds:360000, message:user.rows[0]})
  } catch(err) {
    console.log("Logging error", err);
    return res.status(500).send({err:err.code || 'internal error', message: err.message||'something went wrong'});
  }
});

module.exports = user;
