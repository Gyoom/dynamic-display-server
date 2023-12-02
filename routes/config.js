const router = require('express').Router()
const { JsonDB, Config }  = require('node-json-db');

var db = new JsonDB(new Config("db.json", true, true, '/'));

// Find all
router.get("/", async (req, res, next) => {
  var config = await db.getData("/config");

  res.status(200).json(config)
})

// Insert One
router.post("/", async (req, res, next) => {
  const newConfig = req.body

  await db.push("/config", {
    updateDisplayDelay: newConfig.updateDisplayDelay,
    reloadDelay: newConfig.reloadDelay,
  }, true);

  res.status(200).json()

})



module.exports = router