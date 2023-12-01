const router = require('express').Router()
const { JsonDB, Config }  = require('node-json-db');
const NotFoundError = require('../utils/NotFoundError')
const fse = require('fs-extra')
const fs = require('fs')
const path = require('path');
const multer = require('multer');
const upload = multer ( {  dest : 'uploads/'  } )

var db = new JsonDB(new Config("db.json", true, false, '/'));

// Find all
router.get("/", async (req, res, next) => {
  var rawSlides = await db.getData("/slides");

  var correctOrderSlides = []
    for (let i = 0; i < rawSlides.length; i++) {
        for (let y = 0; y < rawSlides.length; y++) {
            if (rawSlides[y].order === i)
            {
              correctOrderSlides[i] = rawSlides[y]
            } 
        } 
    }
  res.json(correctOrderSlides)
})

// Insert One
router.post("/", upload.single('file'), async (req, res, next) => {
  const newSlide = req.body

  var data = await db.getData("/slides");
  var newData = [...data, newSlide]

  await db.push("/slides", newData);
  res.json(newData)

  /*
  fs.readFile(req.file.path, (err, data)=>{
    // error handle
    if(err) {
        throw err;
    }
    // convert image file to base64-encoded string
    const base64Image = Buffer.from(data, 'binary').toString('base64');
    
    // combine all strings
    const base64ImageStr = `data:${req.file.mimetype};base64,${base64Image}`;
    // function dataURLtoFile(dataurl, filename) {
    //   var arr = dataurl.split(','),
    //       mime = arr[0].match(/:(.*?);/)[1],
    //       bstr = atob(arr[arr.length - 1]), 
    //       n = bstr.length, 
    //       u8arr = new Uint8Array(n);
    //   while(n--){
    //       u8arr[n] = bstr.charCodeAt(n);
    //   }
    //   return new File([u8arr], filename, {type:mime});
    //}
  
    // //Usage example:
    // var file = dataURLtoFile(base64ImageStr,'hello.png');
    // console.log(file);
  })
  */
})

// change Order
router.put("/order", async (req, res, next) => {
  const newOrder = req.body
  var data = await db.getData("/slides");

  for (let index = 0; index < data.length; index++) {
    data[index].order = newOrder.find(e => e.id === data[index].id).order
  }

  await db.push("/slides", data)
  res.json(data)
})

router.delete("/:id", async (req, res, next) => {
  // Check existing
  
  var id = req.params.id
  var data = await db.getData("/slides");

  var newData = data.filter(slide => slide.id !== id)
  for (let index = 0; index < newData.length; index++) {
      newData[index].order = index
  }

  await db.push("/slides", newData);
  res.status(200).json()
  
});



module.exports = router
