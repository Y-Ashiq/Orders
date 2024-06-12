import express from "express";
import connection from "../configs/database.js";
const orderRouter = express.Router();


//Create order.
orderRouter.post("/createOrder", async (req, res) => {
  let { customerId, orderItems } = req.body;
  let total = 0;
  let round = 0;
  let date = new Date().toISOString();

  orderItems.forEach((element) => {
    connection.execute(
      `SELECT unitPrice FROM products WHERE id = ${element.productid}`,
      (error, data) => {
        if (error) {
          return res.status(500).json({ message: error.message });
        }

        const unitPrice = data[0].unitPrice;
        total += unitPrice * element.quantity;

        connection.execute(
          `INSERT INTO orders(customerID,orderDate, totalAmount) VALUES ('${customerId}','${date}','${total}')`,
          (err, data) => {
            console.log(total);

            if (err) {
              return res.status(500).json({ message: err });
            }

            let order_id = data.insertId;

            orderItems.forEach((ele) => {
              connection.execute(
                `INSERT INTO ordereditems(orderID, productID, unitPrice, quantity) VALUES ('${order_id}','${ele.productid}','${unitPrice}','${ele.quantity}')`,
                (err, data) => {
                  if (err) {
                    return res.status(500).json({ message: err });
                  }
                }
              );
            });
            round++;

            if (round === orderItems.length) {
              res.send("ok");
            }
          }
        );
      }
    );
  });
});


//2- API to calculate the average order value.

orderRouter.get("/getAVG", (req, res) => {
  connection.execute(
    `SELECT AVG(totalAmount) AS average_order_value FROM orders`,
    (err, data) => {
      if (err) {
        return res.status(500).json({ message: err });
      }
      res.status(200).json({ message: data });
    }
  );
});
// a query to list all customers who have not made any orders.
orderRouter.get("/customerNoOrders", (req, res) => {
  connection.query(
    `
        SELECT * FROM customers
        WHERE id NOT IN (SELECT DISTINCT customerID FROM orders)
    `,
    (err, data) => {
      if (err) return res.status(500).send(err);
      res.send(data);
    }
  );
});

//API to list the top 10 customers who have spent the most money.
orderRouter.get("/topTen", (req, res) => {
  connection.query(
    `
        SELECT * FROM orders
        ORDER BY totalAmoutn DESC lIMIT 10
    `,
    (err, data) => {
      if (err) return res.status(500).send(err);
      res.send(data);
    }
  );
});


//API to list all customers who have made at least 5 orders.
orderRouter.get("/leastFiveOrders", (req, res) => {
  connection.query(
    `
      SELECT customerID, COUNT(*) AS order_count FROM orders GROUP BY customerID HAVING COUNT(*) >= 5

    `,
    (err, data) => {
      if (err) return res.status(500).send(err);
      res.send(data);
    }
  );
});


//API to find the customer who has made the earliest order.
orderRouter.get("/earlistCustomer", (req, res) => {
  connection.query(
    `
      SELECT * FROM orders ORDER BY orderDate ASC


    `,
    (err, data) => {
      if (err) return res.status(500).send(err);
      res.send(data);
    }
  );
});



//API to find the percentage of customers who have made more than one order.
orderRouter.get("/moreThanTwoOrder", (req, res) => {
  connection.query(
    `
      SELECT customerID, COUNT(*) AS order_count
        FROM orders
        GROUP BY customerID
        HAVING order_count > 1;


    `,
    (err, data) => {
      if (err) return res.status(500).send(err);

      const total_customers = data.length;

      connection.execute(
        "SELECT COUNT(*) AS row_count FROM customers",
        (err, data) => {
          if (err) return res.status(500).send(err);
          const percentage = (total_customers / data[0].row_count) * 100;

          res.json({ percentage });
        }
      );
    }
  );
});

export default orderRouter;
