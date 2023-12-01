const router = require('express').Router()
const { JsonDB, Config }  = require('node-json-db');
const NotFoundError = require('../utils/NotFoundError')
const puppeteer = require('puppeteer')

var db = new JsonDB(new Config("db.json", true, false, '/'));

const MyReportScreenshots = async (screenshots, slides) => {
    const browser = await puppeteer.launch({ headless: true });
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
                screenshots[slides[index].id] = '404'
            }
        }
        browser.close();
        return
    })
    const url = await page.url();
    // redirect to login
    if (url.startsWith('http://srvfactorytrack.wavnet.be:8080/auth/Account/Login'))
    {
        await page.type('#Username', 'stagiaire')
        await page.click('body > div > div > div > form > fieldset > button')
        await page.type('#Password', 'Alpha2023$')
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
            if (slides[index].domainId === 1)
            {
                screenshots[slides[index].id] = '404'
            }
        }
        await browser.close();
        return
    }
    // get tabs screenshots
    for (let index = 0; index < slides.length; index++) {
        if (slides[index].domainId === 1)
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
                height: 1080,
                deviceScaleFactor: 1
              });
            const screenshotBuffer = await page.screenshot({ encoding: 'base64', fullPage: true });
            screenshots[slides[index].id] = "data:image/png;base64, " + screenshotBuffer
        }
    }

    await browser.close();
}

const screenshotWebsite = async (screenshots, slides, slide) => {
    switch (slide.domainId) {
        case 1:
            await MyReportScreenshots(screenshots, slides)
            break;
        default:
            break;
    }
}

router.get('/', async (req, res) => {
    var rawSlides = await db.getData("/slides");
    
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
    var screenshots = []
    var usedDomain = []
    // fill slides
    for (let index = 0; index < slides.length; index++) {
        // screenshot Slides
        if (slides[index].domainId !== -1)
        {
            if (!usedDomain.find(d => d === slides[index].domainId))
            {
                usedDomain.push(slides[index].domainId)
                await screenshotWebsite(screenshots, slides, slides[index])
            }
        }
        // uploded Slides
        else if (slides[index].picture !== "")
        {
            screenshots[index] = slides[index].picture
        }
    }
    
    res.json(screenshots)
})

module.exports = router