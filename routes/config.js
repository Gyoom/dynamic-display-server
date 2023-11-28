const router = require('express').Router()
const { JsonDB, Config }  = require('node-json-db');
const NotFoundError = require('../utils/NotFoundError')

var db = new JsonDB(new Config("db.json", true, false, '/'));

// Find all
router.get("/", async (req, res, next) => {
  var data = await db.getData("/");
  res.json(data)
})

// Find by ID
router.get("/:path", async (req, res, next) => {
  var data = await db.getData("/" + req.params.path);
  res.json(data)
})

// Delete one
router.delete("/:id", (req, res, next) => {
  
});

// Insert one
router.post("/", (req, res, next) => {
  
})

// Update one
router.put("/:id", (req, res, next) => {
 
})



module.exports = router
