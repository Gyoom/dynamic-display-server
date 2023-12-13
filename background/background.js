const Slide = require("../models/slide")
const domainSelector = require('../routes/screenshotDomain/domainSelector')
const ConfigApp = require("../models/config")

var activeSession = 0 
var currentConfig = {}
var isLoopActive = false


const initLoad = async () => {
    if (true)
    {
        activeSession++
        if (!isLoopActive)
            loop()
    }
}

const loop = async () => {
    isLoopActive = true
    while(activeSession > 0)
    {
        console.log('[' + new Date().toLocaleString() + '] - load pictures begin')
        await ConfigApp.find({ id: 0})
            .then(config => currentConfig = config[0])
        await loadPicture()
        await ConfigApp.updateOne({ id: 0 }, { lastLoadDate: new Date() })
                .catch(err => console.log(err))
        console.log('[' + new Date().toLocaleString() + '] - load pictures ended')
        await new Promise(res => setTimeout(res, currentConfig.reloadDelay * 60 * 1000))
    }
    isLoopActive = false
}

const loadPicture = async () => {
    var slides = []
    await Slide.find({})
        .then(dbSlides => slides = dbSlides)
        .catch(e => {
            console.log('Error : backgroundTask : get slides from database :', e)
            return
        })
    tempImage = ""
    for (let index = 0; index < slides.length; index++) {
        if (slides[index].domain !== "")
        {
            // do screenshot
            try {
                tempImage = await domainSelector.select(slides[index])
            } catch (e) {
                console.log('\n', e, '\n')
                continue
            }

            // check picture found
            if (tempImage === "")
            {
                console.log('Error : backgroundTask : screenshot not found')
                continue
            }

            // update screenshot database
            try {
                await Slide.updateOne({ id: slides[index].id }, { picture: slides[index].picture })
            } catch (e) {
                console.log('\n', 'Error : backgroundTask : update picture in DB "' + slides[index].name + '" :\n', e, '\n')
                continue
            }
            console.log('[' + new Date().toLocaleString() + '] - new screenshot - "' +  slides[index].name + '"')

        }
    }
    
    
}

module.exports = initLoad