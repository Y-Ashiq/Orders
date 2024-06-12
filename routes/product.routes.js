import express from "express";
import connection from "../configs/database.js";
const productRouter = express.Router();

productRouter.post("/addProduct", (req, res) => {
  let { productName, category, unitPrice } = req.body;

  connection.execute(
    `INSERT INTO products( productName, category, unitPrice) VALUES ('${productName}','${category}',${unitPrice})`,
    function (err, data) {
      if (err) {
        return res.status(400).json({ message: "error", error: err });
      }

      res.status(200).json({ message: "product added successfully", data });
    }
  );
});

productRouter.get("/getRevenue", (req, res) => {
  connection.execute(
    "SELECT SUM(unitPrice) AS totalPrice FROM products",
    function (err, data) {
      if (err) {
        return res.status(400).json({ message: "error", error: err });
      }

      res.status(200).json({ message: data });
    }
  );
});

export default productRouter;
