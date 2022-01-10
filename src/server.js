const express = require("express");
const joi = require('joi');


const fs = require("fs"); // file system
const path = require("path");

const pathProductsJSON = path.join(__dirname, "./data/products.json");

let products = JSON.parse(fs.readFileSync(pathProductsJSON).toString()); // string json --> objet js

const schemaPost = joi.object({
  id: joi.number().integer().min(1).required(),
  title: joi.string().min(3).max(100).required(),
  price: joi.number().integer().precision(2).min(0.01).required(),
  description: joi.string().min(10).max(800).required(),
  category: joi.string().min(3).max(20).required(),
  image: joi.string().pattern(/^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/).required(),
  rating: joi.object({
    rate: joi.number().integer().precision(1).min(0).max(5).required(),
    count: joi.number().integer().min(1).required()
  })
});


const app = express();

app.use(express.json());

app.get("", (req, res) => {
  // res==>response
  console.log("requête entrante sur la homepage");
  res.send("Homepage");
});

app.get("/api/products", (req, res) => {
  res.status(200).send(products);
});

app.post("/api/products", (req, res) => {
  const product = req.body;

  product.id = products[products.length - 1].id + 1;

  products.push(product);

  res.status(201).send(products);
});

app.delete('/api/products/:id', (req, res) => {
  const productid = parseInt(req.params.id);
  
  //const find = products.find(produit => produit.id === productid)
  //const index = products.indexOf(find);
  const product = products.find(produit => produit.id === productid)

  if(!product){
    return res.status(404).send("product not found with the given id !")
  }
  products = products.filter(produit => produit.id != productid);
  res.status(202).send(product);
})

app.put("/api/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  console.log(productId);
  const change = req.body;
  console.log(change);
  const product = products.find(produit => produit.id === productId);

  if(!product){
    return res.status(404).send("product not found with the given id!");
  }
  const schemaPut = joi.object({
    id: joi.number().integer().min(1),
    title: joi.string().min(3).max(100),
    price: joi.number().integer().precision(2).min(0.01),
    description: joi.string().min(10).max(800),
    category: joi.string().min(3).max(20),
    image: joi.string().pattern(/^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/),
    rating: joi.object({
      rate: joi.number().integer().precision(1).min(0).max(5),
      count: joi.number().integer().min(1)
    })
  });
  const {error} = schemaPut.validate(change); // Vérifie si change correspond bien au schema
  if(error){
    return res.status(400).send(error);
  }
  for(const key in change) {
    product[key] = change[key];
  }
  res.status(201).send(product);
});

app.get("/api/products/:id", (req, res) => {
  const productId = parseInt(req.params.id)
  const product = products.find(produit => produit.id === productId);
  if(!product){
    return res.status(404).send("product not found with the given id!");
  }
  res.status(200).send(product);
})

app.listen(process.env.PORT || 3000, () =>
  console.log(`Listenning on port ${process.env.PORT} || 3000...`)
);



