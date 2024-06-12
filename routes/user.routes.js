import express from "express";
import connection from "../configs/database.js";
const userRouter = express.Router();

userRouter.post("/signup", (req, res) => {
  let { firstName, lastName, email, phone } = req.body;
  connection.execute(
    `SELECT * FROM customers WHERE email='${email}' OR phone='${phone}'`,
    (err, data) => {
      if (err) return res.status(500).json({ message: err });

      if (data.length > 0) {
        return res.status(404).json({ message: "email or passowrd exist" });
      }

      connection.execute(
        `INSERT INTO customers(firstName, lastName, email, phone) VALUES ('${firstName}','${lastName}','${email}',${phone})`,
        function (err, data) {
          if (err) return res.status(500).json({ message: err });

          res.status(201).json({ message: "user add", data });
        }
      );
    }
  );
});

userRouter.post("/login", (req, res) => {
  let { email, phone } = req.body;

  connection.execute(
    `SELECT EXISTS (SELECT * FROM customers WHERE email="${email}"AND phone=${phone}) AS row`,
    function (err, data) {
      if (err) {
        return res.status(400).json({ message: "error", error: err });
      }

      if (data[0].row === 1) {
        res.status(200).json({ message: "successful login" });
      } else {
        res.status(400).json({ message: "email or password not correct" });
      }
    }
  );
});

export default userRouter;
