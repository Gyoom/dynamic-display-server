const router = require('express').Router()
const { JsonDB, Config }  = require('node-json-db');
const NotFoundError = require('../utils/NotFoundError')
const fse = require('fs-extra')
const multer = require('multer');
const  upload  =  multer ( {  dest : 'uploads/'  } )
var FileSaver = require('file-saver');

var db = new JsonDB(new Config("db.json", true, false, '/'));

// Find all
router.get("/", async (req, res, next) => {
  var data = await db.getData("/");

  data = data.slides

  res.json(data)
})

// Find by ID
router.get("/:path", async (req, res, next) => {
  var data = await db.getData("/" + req.params.path);

  res.json(data)
})

// Insert one
router.post("/",  async (req, res, next) => {
  const body = req.body
  // console.log('body', body)
  
  //FileSaver.saveAs(new Blob([base64], {type: "image/png"}),"filename.jpg")
  // fse.outputFile('test.png', JSON.stringify(body), err => {
  //   console.log(err)
  // })
  await db.push("/slides", body);

  var data = await db.getData("/slides");
  res.json(data)
})



module.exports = router
