const router = require('express').Router()
const ConfigApp = require("../models/config")

// Find all
router.get("/", async (req, res, next) => {
  ConfigApp
    .find({})
    .then(config => res.status(200).json(config[0]))
    .catch(err => {
      console.log('\n', 'Error / configs / GET 0 / db request : ', err, '\n')
      res.status(500).json()
      return
    })
  
})

// Insert One
router.post("/", async (req, res, next) => {
  const newConfig = req.body

  await ConfigApp
    .updateOne({ id:0 }, 
    {
      displayDelay: newConfig.displayDelay,
      reloadDelay: newConfig.reloadDelay,
      transitionDelay : newConfig.transitionDelay,
      domains : newConfig.domains
    })
    .catch(err => {
      console.log('\n', 'Error / configs / POST config / db request : ', err, '\n')
      res.status(500).json()
      return
    })

  res.status(200).json()

})



module.exports = router