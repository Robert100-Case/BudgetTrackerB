const router = require("express").Router();
//const path = require('path');

const Transaction = require("../models/transaction.js");

router.post("/api/transaction", ({body}, res) => {
  Transaction.create(body)
    .then(dbTransaction => {
      res.json(dbTransaction);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

router.post("/api/transaction/bulk", ({body}, res) => {
  console.log("bulk route reached");
  Transaction.insertMany(body)
    .then(dbTransaction => {
      res.json(dbTransaction);
      //console.log("bulk router reached " + dbTransaction);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

router.get("/api/transaction", (req, res) => {
  Transaction.find({}).sort({date: -1})
    .then(dbTransaction => {
      res.json(dbTransaction);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});
/*router.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));

})*/

module.exports = router;