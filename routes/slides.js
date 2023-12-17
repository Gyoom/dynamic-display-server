const router = require('express').Router()
const Slide = require("../models/slide")
const Serie = require('../models/serie')

// Find all without picture
router.get("/", async (req, res, next) => {
  // get data from database
  var rawSlides = []
  await Slide.find({})
    .then(slides => rawSlides = slides)
    .catch(err => {
      console.log('\n' + 'slides --> GET AllWhitoutPicture --> database request :\n', err + '\n')
      res.status(500).json()
      return
    })
  
  // remove picture
  for (let index = 0; index < rawSlides.length; index++) {
    rawSlides.picture = ''
  }

  res.status(200).json(rawSlides)
})

// Find by serie id
router.get("/serie/:id", async (req, res, next) => {
  var serieId = req.params.id
    // get serie from database
  var serie = {}
  await Serie.find({ id: serieId })
    .then(series => serie = series[0])
    .catch(err => {
      console.log('\n' + 'slides --> GET by serie id --> database request : ', err + '\n')
      res.status(500).json()
      return
    })

  // get slides serie from database
  var slides = []
  for (let i = 0; i < serie.slides.length; i++) {
    for (let y = 0; y < serie.slides.length; y++) {
      if (serie.slides[y].order === i)
      {
        await Slide.find({ id: serie.slides[y].slideId })
          .then(dbSlides => slides.push(dbSlides[0]))
          .catch(err => {
              console.log('\n' + 'slides --> GET by serie id --> database request : ', err + '\n')
              res.status(500).json()
              return
          })
        break
      }
    }
  }
  res.status(200).json(slides)
})

// Insert One
router.post("/", async (req, res, next) => {
  const newSlide = req.body

  await Slide
    .create({
      id: newSlide.id,
      name: newSlide.name,
      domain: newSlide.domain,
      webpagePathData: newSlide.webpagePathData,
      picture: newSlide.picture
    })
    .catch(err => {
      console.log('\n' + 'slides --> POST One --> database request : ', err + '\n')
      res.status(500).json()
      return
    })

  res.status(200).json(newSlide)
})

router.delete("/:id", async (req, res, next) => {
  var id = req.params.id

  // delete slide
  await Slide
    .deleteOne({ id:id })
    .catch(err => {
      console.log('\n' + 'slides --> DELETE One --> database request --> DELETE Slide : ', err + '\n')
      res.status(500).json()
      return
    })
    // get series
    var series = []
    await Serie
      .find({})
      .then(dbSeries => series = dbSeries)
      .catch(err => {
        console.log('\n' + 'slides --> DELETE One --> database request --> GET Series : ', err + '\n')
        res.status(500).json()
        return
      })
    
    // update series 
    series.forEach(async (serie) => {
  
        var newSlides = serie.slides.filter(slide => slide.id !== id)
        if (newSlides.length !== serie.slides.length)
        {
          await Serie.updateOne({ id: serie.id }, { slides: newSlides})
          .catch(err => {
            console.log('\n' + 'slides --> DELETE One --> database request --> GET Series : ', err + '\n')
            res.status(500).json()
            return
          })
        }
    })

  res.status(200).json()
})



module.exports = router
