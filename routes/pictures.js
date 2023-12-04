require('dotenv').config()
const router = require('express').Router()
const puppeteer = require('puppeteer')
const Slide = require("../models/slide")

const AI_LOGIN = process.env.AI_LOGIN
const AI_PASSWORD = process.env.AI_PASSWORD

const MyReportScreenshots = async (pictures, slides) => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    // connect to alphaInnovationPage
    await page.goto(
        'http://srvfactorytrack.wavnet.be:8080/project/ALPHA%20INNOVATIONS/dashboard/Dashboards_b796601b-c5be-4061-94f6-341012dc9291/view',
        {
            waitUntil: "networkidle0",
        }
    ).catch(err => {
        for (let index = 0; index < slides.length; index++) {
            if (slides[index].domainId === 1)
            {
                pictures[slides[index].order] = '404'
            }
        }
        browser.close();
        return
    })
    const url = await page.url();
    // redirect to login
    if (url.startsWith('http://srvfactorytrack.wavnet.be:8080/auth/Account/Login'))
    {
        await page.type('#Username', AI_LOGIN)
        await page.click('body > div > div > div > form > fieldset > button')
        await page.type('#Password', AI_PASSWORD)
        await page.click('body > div > div > div > form > fieldset > button')

        await page.goto(
            'http://srvfactorytrack.wavnet.be:8080/project/ALPHA%20INNOVATIONS/dashboard/Dashboards_b796601b-c5be-4061-94f6-341012dc9291/view',
            {
                waitUntil: "networkidle0",
            }
        );
    } 
    else if (!url.startsWith('http://srvfactorytrack.wavnet.be:8080/'))
    {
        for (let index = 0; index < slides.length; index++) {
            if (slides[index].domainId === "AIMyReport")
            {
                pictures[slides[index].order] = '404'
            }
        }
        await browser.close();
        return
    }
    // get tabs screenshots
    for (let index = 0; index < slides.length; index++) {
        if (slides[index].domainId === "AIMyReport")
        {
            await page.click(
                'body > app-root > div > app-navigation > div > app-dashboard-vue > div > div > div > dx-menu > div > ul > li:nth-child(' + slides[index].domainOrder + ') > div',
                {
                    waitUntil: "networkidle0",
                }
            )
            await page.waitForTimeout(3000);
            await page.setViewport({
                width: 1920,
                height: 810,
                deviceScaleFactor: 1
              });
            const screenshotBuffer = await page.screenshot({ encoding: 'base64', fullPage: true });
            pictures[slides[index].order] = "data:image/png;base64, " + screenshotBuffer
        }
    }

    await browser.close();
}

const screenshotWebsite = async (pictures, slides, currentSlide) => {
    switch (currentSlide.domainId) {
        case "AIMyReport":
            await MyReportScreenshots(pictures, slides)
            break;
        default:
            break;
    }
}
// get all
router.get('/', async (req, res) => {
    // get databases data
    var rawSlides = []
    await Slide
        .find({})
        .then(slides => rawSlides = slides)
        .catch(err => next(err))
    
    // slide order correction 
    var slides = []
    for (let i = 0; i < rawSlides.length; i++) {
        for (let y = 0; y < rawSlides.length; y++) {
            if (rawSlides[y].order === i)
            {
                slides[i] = rawSlides[y]
            } 
        } 
    }
    var pictures = []
    var usedDomain = []
    // fill slides
    for (let index = 0; index < slides.length; index++) {
        // screenshot Slides
        if (slides[index].domainId !== "")
        {
            if (!usedDomain.find(d => d === slides[index].domainId))
            {
                usedDomain.push(slides[index].domainId)
                await screenshotWebsite(pictures, slides, slides[index])
            }
        }
        // uploded Slides
        else if (slides[index].picture !== "")
        {
            pictures[index] = slides[index].picture
        }
    }
    res.json(pictures)
})

module.exports = router