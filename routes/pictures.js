const router = require('express').Router()
const Slide = require("../models/slide")
const domainSelector = require('./screenshotDomain/domainSelector')

// get one by slide id
router.get('/:id', async (req, res, next) => {
    var id = req.params.id
    // get databases slides
    var slides = []
    await Slide
        .find({ id: id })
        .then(dbSlide => slides = dbSlide)
        .catch(e => {
            console.log('Error : API getPictureById : get slides from database :\n', e)
            res.status(500).json()
            return
        })
    
    // chec slides
    if (slides.length === 0)
    {
        console.log('Error : API getPictureById : database slides not founds')
        res.status(404).json()
        return
    }

    // case creenshot Slides
    if (slides[0].domain !== "")
    {    
        // do new screenshot
        var tempImage = ""
        try {
            tempImage = await domainSelector.select(slides[0])
        } catch (e) {
            console.log('Error : API getPictureById : screenshot :\n', e)
            res.status(500).json()
            return
        }
        // check find picture
        if (tempImage === "")
        {
            console.log('Error : API getPictureById : screenshot not found')
            res.status(404).json()
            return
        }

        // update screenshot database
        slides[0].picture = tempImage
        await Slide
            .updateOne({ id: slides[0].id }, { picture: slides[0].picture})
            .catch(e => {
                console.log('Error : API getPictureById : updateDBPicture :\n', e)
                res.status(500).json()
                return
            })
    }

    res.status(200).json(slides[0].picture)
})

module.exports = router