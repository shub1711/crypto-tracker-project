require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const axios = require("axios").default;
const transaction = require("./schema/transaction");
const ethereum = require("./schema/ethereum-price");
const { json } = require("express");

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(`Connection success`);
  })
  .catch((error) => console.log(`no connection ${error}`));

//TASK 1
// check the output in database
app.post("/post-transaction-by-user", async (req, res, next) => {
  try {
    const response = await axios.get(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${req.body.address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${process.env.SECRET_KEY}`
    );
    await transaction.create({
      address: req.body.address,
      transactions: response.data.result,
    });
    console.log("response: ", response);

    res.json({ success: true, msg: "", payload: response.data.result });
    next();
  } catch (e) {
    console.log("error", e);
  }
});

//Task 2
// check the output in database
setInterval(async () => {
  const res = await axios(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr"
  );
  console.log("res at interval: ", res);
  const price = res?.data.ethereum?.inr;
  console.log("price: ", price);
  try {
    const dbResponse = await ethereum.create({
      price,
    });
    console.log("dbResponse: ", dbResponse);
  } catch (e) {
    console.log("Could not find the ethereum price: ", e);
  }
}, 10000);

//Task3
// check the output in postman
app.get("/get-calculated-transaction-balance", async (req, res, next) => {
  try {
    console.log("This function is being called", req.body);
    const response = await axios.get(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${req.body.address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=AYHF5JIZHIGPARSHUFGYV9JB54TU496ZUM`
    );

    let totalBalance = 0;
    response.data.result.forEach((transaction) => {
      if (transaction.from === req.body.address) {
        totalBalance += +transaction.value;
      } else if (transaction.to === req.body.address) {
        totalBalance -= +transaction.value;
      }
    });
    console.log("response", response.data.result);
    res.json({ totalBalance });
    next();
  } catch (e) {
    console.log("error", e);
  }
});

//Listen to this port
app.listen(port, () => {
  console.log(`Server is live at http://localhost:${port}`);
});
