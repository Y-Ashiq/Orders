import express from "express";
import connection from "./configs/database.js";
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import orderRouter from "./routes/order.routes.js";
const app = express();
const port = 3000;

app.use(express.json());

connection;

app.use(userRouter)
app.use(productRouter)
app.use(orderRouter)


  

app.listen(port, () => console.log(`Example app listening on port ${port}!`));