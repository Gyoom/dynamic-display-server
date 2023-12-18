const router = require('express').Router()
const Serie = require('../models/serie')

// get all
router.get("/", async (req, res, next) => {
  // get data from database
  var series = []
  await Serie
    .find({})
    .then(dbSeries => series = dbSeries)
    .catch(err => {
        console.log('\n', 'Error / series / GET All/ db request :', err, '\n')
        res.status(500).json()
        return
    })

  res.status(200).json(series)
})

// get One by Id
router.get("/:id", async (req, res, next) => {
  var id = req.params.id
  // get data from database
  var serie = {}
  await Serie
    .find({ id:id })
    .then(dbSeries => serie = dbSeries[0])
    .catch(err => {
        console.log('\n', 'Error / series / GET one by Id / db request :', err, '\n')
        res.status(500).json()
        return
    })

  res.status(200).json(serie)
})

// Insert One
router.post("/", async (req, res, next) => {
  const newSerie = req.body

  await Serie
    .create({
      id: newSerie.id,
      name: newSerie.name,
      slides: newSerie.slides
    })
    .catch(err =>  {
      console.log('\n', 'Error / series / POST one / db request :', err, '\n')
      res.status(500).json()
      return
    })

  res.status(200).json(newSerie)
})

// delete One
router.delete("/:id", async (req, res, next) => {
  var id = req.params.id

  await Serie
    .deleteOne({ id:id })
    .catch(err =>  {
      console.log('\n', 'Error / series / DELETE one / db request :', err, '\n')
      res.status(500).json()
      return
    })

  res.status(200).json()
  
})

// Add slide
router.put("/addSlides/:id", async (req, res, next) => {
  var id = req.params.id
  var newSlide = req.body

  var serie = {}
  await Serie
    .find({ id:id })
    .then(dbSeries => serie = dbSeries[0])
    .catch(err =>  {
      console.log('\n', 'Error / series / UPDATE add one slide / db request get :', err, '\n')
      res.status(500).json()
      return
    })

  var newSlides = [...serie.slides, newSlide]

  await Serie
    .updateOne({ id:id }, { slides: newSlides})
    .catch(err =>  {
      console.log('\n', 'Error / series / UPDATE add one slide / db request update :', err, '\n')
      res.status(500).json()
      return
    })

  res.status(200).json()
  
})

// Remove slide
router.put("/removeSlides/:id", async (req, res, next) => {
  var serieId = req.params.id
  var body = req.body
  var serie = {}
  await Serie
    .find({ id:serieId })
    .then(dbSeries => serie = dbSeries[0])
    .catch(err =>  {
      console.log('\n', 'Error / series / UPDATE remove one slide / db request get :', err, '\n')
      res.status(500).json()
      return
    })

  var newSlides = serie.slides.filter(s => s.id !== body.serieSlideId)
  await Serie
    .updateMany({ id: serieId }, { slides: newSlides })
    .catch(err => {
        console.log('\n', 'Error / series / UPDATE remove one slide / db request update :', err, '\n')
        res.status(500).json()
        return
    })

  res.status(200).json()
  
})

// Update Order
router.put("/updateOrder/:id", async (req, res, next) => {
  var serieId = req.params.id
  var body = req.body
  
  // get serie to update
  var serie = {}
  await Serie
    .find({ id:serieId })
    .then(dbSeries => serie = dbSeries[0])
    .catch(err => {
      console.log('\n', 'Error / series / UPDATE order / db request get :', err, '\n')
      res.status(500).json()
      return
    })
  
  // change order values
  for (let index = 0; index < serie.slides.length; index++) {
    serie.slides[index].order = body.find(i => i.id === serie.slides[index].id).order
  }

  // update serie in db
  await Serie
    .updateMany({ id: serieId }, { slides: serie.slides })
    .catch(err => {
      console.log('\n', 'Error / series / UPDATE order / db request update :', err, '\n')
      res.status(500).json()
      return
    })

  res.status(200).json()
  
})

// Update Params
router.put("/updateParams/:id", async (req, res, next) => {
  var serieId = req.params.id
  var body = req.body
  
  await Serie
    .updateMany({ id: serieId }, { 
      name: body.name,
      reloadDelay: body.reloadDelay, 
      displayDelay: body.displayDelay,
      transitionDelay: body.transitionDelay
    })
    .catch(err => {
      console.log('\n', 'Error / series / UPDATE params / db request update :', err, '\n')
      res.status(500).json()
      return
    })

  res.status(200).json()
  
})



module.exports = router