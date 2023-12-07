const router = require('express').Router()
const Slide = require("../models/slide")
const domainSelector = require('./screenshotDomain/domainSelector')

// get all
router.get('/:id', async (req, res, next) => {
    var id = req.params.id
    // get databases data
    var slide
    await Slide
        .find({ id: id})
        .then(dbSlide => slide = dbSlide)
        .catch(err => next(err))

    // screenshot Slides
    if (slide.domain !== "")
    {    
        var tempImage = ""
        try {
            tempImage = await domainSelector.select(slide[0], res)
        } catch (error) {
            res.status(500).json()
            return
        }
        
        slide[0].picture = tempImage
        await Slide
            .updateOne({ id: slide[0].id }, { picture: slide[0].picture})
            .catch(err => {
                console.log(err)
                res.status(500).json()
                return
            })
    }

    res.status(200).json(slide[0].picture)
})

module.exports = router