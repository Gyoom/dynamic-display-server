const router = require('express').Router()
const Slide = require("../models/slide")
const domainSelector = require('./screenshotDomain/domainSelector')
initLoad = require('../background/background')

// Find all without picture
router.get("/", async (req, res, next) => {
  // get data from database
  var rawSlides = []
  await Slide.find({})
  .then(slides => rawSlides = slides)
  .catch(e => {
    console.log('Error : API getAllSlidesWhitoutPicture : get slides from database :\n', e)
    res.status(500).json()
    return
  })

  // order correction
  var correctOrderSlides = []
  for (let i = 0; i < rawSlides.length; i++) {
      for (let y = 0; y < rawSlides.length; y++) {
          if (rawSlides[y].order === i)
          {
            rawSlides[y].picture = ""
            correctOrderSlides[i] = rawSlides[y]
          } 
      } 
  }
  res.status(200).json(correctOrderSlides)
})

// Find all
router.get("/todisplay", async (req, res, next) => {
  // get data from database
  var rawSlides = []
  await Slide.find({})
  .then(slides => rawSlides = slides)
  .catch(err => next(err))

  // order correction
  var correctOrderSlides = []
  for (let i = 0; i < rawSlides.length; i++) {
      for (let y = 0; y < rawSlides.length; y++) {
          if (rawSlides[y].order === i)
          {
              correctOrderSlides[i] = rawSlides[y]
              if (correctOrderSlides[i].picture === "")
              {   
                  var tempImage = ""
                  try {
                      tempImage = await domainSelector.select(correctOrderSlides[i])
                  } catch (error) {
                      res.status(500).json()
                      return
                  }
                  correctOrderSlides[i].picture = tempImage
                    
                  await Slide
                      .updateOne({ id: correctOrderSlides[i].id }, { picture: correctOrderSlides[i].picture})
                      .catch(e => {
                        console.log(e)
                        res.status(500).json()
                        return
                  })
              }
          } 
      } 
  }
  //initLoad()
  res.status(200).json(correctOrderSlides)
})

// Insert One
router.post("/", async (req, res, next) => {
  const newSlide = req.body

  await Slide
    .create({
      id: newSlide.id,
      order: newSlide.order,
      name: newSlide.name,
      domain: newSlide.domain,
      webpagePathData: newSlide.webpagePathData,
      picture: newSlide.picture
    })
    .catch(err => next(err))

  res.status(200).json(newSlide)
})

// change Order
router.put("/order", async (req, res, next) => {
  const newOrder = req.body

  var count = 0
  await Slide
    .countDocuments()
    .then(countDocuments => count = countDocuments)
    .catch(err => next(err))

  for (let index = 0; index < count; index++) {
    await Slide
      .updateMany({ id: newOrder[index].id }, { order: newOrder[index].order})
      .catch(err => next(err))
  }

  res.status(200).json()
})

router.delete("/:order", async (req, res, next) => {
  var deletedOrder = req.params.order

  await Slide.deleteOne({ order:deletedOrder })

  var count = 0
  await Slide
    .countDocuments()
    .then(countDocuments => count = countDocuments)
    .catch(err => next(err))
  

  var initialIndex = +deletedOrder + 1
  for (let index = initialIndex; index <= count; index++) {
    await Slide
      .updateOne({ order: index }, { order: index - 1 })
      .catch(err => next(err))
  }

  res.status(200).json()
  
});



module.exports = router
