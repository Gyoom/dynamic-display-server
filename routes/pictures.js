const router = require('express').Router()
const Slide = require("../models/slide")
const domainSelector = require('./screenshotDomain/domainSelector')

// get all
router.get('/:id', async (req, res, next) => {
    var id = req.params.id
    // get databases slide
    var slide
    await Slide
        .find({ id: id })
        .then(dbSlide => slide = dbSlide)
        .catch(err => next(err))

    // screenshot Slides
    if (slide.domain !== "")
    {    
        // do new screenshot
        var tempImage = ""
        try {
            tempImage = await domainSelector.select(slide[0])
        } catch (error) {
            console.log(error)
            res.status(500).json()
            return
        }
        
        // update screenshot database
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