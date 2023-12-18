const Slide = require("../models/slide")
const domainSelector = require('./screenshotDomain/domainSelector')
const ConfigApp = require("../models/config")

var activeSession = 0 
var currentConfig = {}
var isLoopActive = false


const initLoad = async () => {
    if (!isLoopActive)
        loop()
}

const loop = async () => {
    isLoopActive = true
    while(true)
    {
        console.log('[' + new Date().toLocaleString() + '] - load pictures begin')

        await ConfigApp
            .find({ id: 0})
            .then(config => currentConfig = config[0])
        await loadPicture()
        await ConfigApp
            .updateOne({ id: 0 }, { lastLoadDate: new Date() })
            .catch(err => console.log('\n' + err + '\n'))

        console.log('[' + new Date().toLocaleString() + '] - load pictures ended')
        await new Promise(res => setTimeout(res, currentConfig.reloadDelay * 60 * 1000))
    }
    isLoopActive = false
}

const loadPicture = async () => {
    var slides = []
    await Slide
        .find({})
        .then(dbSlides => slides = dbSlides)
        .catch(err => {
            console.log('\n', 'Error : backgroundTask : get slides from database :', err, '\n')
            return
        })
    tempImage = ""
    for (let i = 0; i < slides.length; i++) {
        if (slides[i].domain !== "")
        {
            // do screenshot (3 attempts)
            for (let y = 0; y < 3; y++) {
                try {
                    tempImage = await domainSelector.select(slides[i])
                    break   
                } catch (err) {
                    console.log('\n', err, '\n')
                    continue
                }
            }

            // check picture found
            if (tempImage === "")
            {
                console.log('\n', 'Error : backgroundTask : screenshot not found', '\n')
                continue
            }

            // update screenshot database
            try {
                await Slide
                    .updateOne({ id: slides[i].id }, { picture: slides[i].picture })
            } catch (err) {
                console.log('\n', 'Error : backgroundTask : update picture in DB "' + slides[i].name + '" :', err, '\n')
                continue
            }
            console.log('[' + new Date().toLocaleString() + '] - new screenshot - "' +  slides[i].name + '"')

        }
    }
    
    
}

module.exports = initLoad