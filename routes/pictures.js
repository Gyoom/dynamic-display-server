require('dotenv').config()
const router = require('express').Router()
const puppeteer = require('puppeteer')
const Slide = require("../models/slide")

const MYREPORT_LOGIN = process.env.MYREPORT_LOGIN
const MYREPORT_PASSWORD = process.env.MYREPORT_PASSWORD

const GRAFANA_LOGIN = process.env.GRAFANA_LOGIN
const GRAFANA_PASSWORD = process.env.GRAFANA_PASSWORD

const GraphanaScreenshots = async (pictures, currentSlide, screenResolution) => {
        const browser = await puppeteer.launch({ headless: 'new' })
        const page = await browser.newPage()

        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1
        })

        await page.goto('http://130.145.57.41:3000/proxyGrafana/d/' + currentSlide.webpagePathData,
        {
            waitUntil: "networkidle0",
        })
        await page.waitForNetworkIdle()
        // check login page
        const url = await page.url()
        if (url.startsWith('http://130.145.57.41:3000/proxyGrafana/login'))
        {
            // login
            await page.type('input[name=user]', GRAFANA_LOGIN);

            await page.type('input[name=password]', GRAFANA_PASSWORD)

            await page.click("#pageContent > div > div > div.css-17taakh > div > div > div.css-9h8xxw > div > div > form > button",
            {
                waitUntil: "networkidle0",
            })
        }
        // error 404 - dont find webpage 
        else if (!url.startsWith('http://130.145.57.41:3000/proxyGrafana'))
        {
            pictures[slides[index].order] = '404'
            await browser.close()
            return
        }
  
        await page.waitForNetworkIdle()
        await new Promise(r => setTimeout(r, 1000))

        const screenshotBuffer = await page.screenshot({ encoding: 'base64', type:'jpeg', quality:100 });
        pictures[currentSlide.order] = "data:image/jpg;base64, " + screenshotBuffer

        await browser.close();
}

const MyReportScreenshots = async (pictures, slides, screenResolution, res) => {
    const browser = await puppeteer.launch({ headless: "new" })
    const page = await browser.newPage()

    await page.setViewport({
        width: screenResolution.width,
        height: screenResolution.height,
        deviceScaleFactor: 1
    })
    

    // connect to alphaInnovationPage
    await page.goto(
        'http://srvfactorytrack.wavnet.be:8080/project/ALPHA%20INNOVATIONS/dashboard/Dashboards_b796601b-c5be-4061-94f6-341012dc9291/view',
        {
            waitUntil: "networkidle0",
        }
    ).catch(err => {
        for (let index = 0; index < slides.length; index++) {
            if (slides[index].domain === 'AIMyReport')
            {
                pictures[slides[index].order] = '404'
            }
        }
        browser.close();
        return
    })
    const url = await page.url()
    // redirect to login
    if (url.startsWith('http://srvfactorytrack.wavnet.be:8080/auth/Account/Login'))
    {
        await page.type('#Username', MYREPORT_LOGIN)
        await page.click('body > div > div > div > form > fieldset > button')
        await page.type('#Password', MYREPORT_PASSWORD)
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
            if (slides[index].domain === "AIMyReport")
            {
                pictures[slides[index].order] = '404'
            }
        }
        await browser.close();
        return
    }
    await new Promise(r => setTimeout(r, 1000))
    // get tabs
    const childrens = await page.evaluate(async () => {
        const names = [];
        for (element of (await document.querySelector('body > app-root > div > app-navigation > div > app-dashboard-vue > div > div > div > dx-menu > div > ul')).children) {
            var beginIndex = element.innerHTML.indexOf("class=\"ng-tns-c119-0\">")
            var endIndex =  element.innerHTML.indexOf("</span></div></div></div>")
            names.push(element.innerHTML.substring(beginIndex + 22, endIndex));
        }
        return names;
    }).catch(e => {
        console.log('error : ', e)
        res.status(400).json()
        return
    })
    // find correponding tag
    for (let i = 0; i < slides.length; i++) {
        if (slides[i].domain === 'AIMyReport') {
            for (let y = 0; y < childrens.length; y++) {
                if (childrens[y] === slides[i].webpagePathData)
                {
                    y = y + 1
                    await page.click(
                        'body > app-root > div > app-navigation > div > app-dashboard-vue > div > div > div > dx-menu > div > ul > li:nth-child(' + y + ') > div',
                        {
                            waitUntil: "networkidle0",
                        }
                    )
                    await page.waitForNetworkIdle()
                    //await new Promise(r => setTimeout(r, 1000))
                    const screenshotBuffer = await page.screenshot({ encoding: 'base64', type:'jpeg', quality:100, fullPage: true });
                    pictures[slides[i].order] = "data:image/jpg;base64, " + screenshotBuffer
                    break
                }
                
            }
        }
    }

    await browser.close();
}

const screenshotWebsite = async (pictures, slides, currentSlide, screenResolution, res) => {
    switch (currentSlide.domain) {
        case 'AIMyReport':
            await MyReportScreenshots(pictures, slides, screenResolution, res)
            break;
        case "AIGraphana":
            await GraphanaScreenshots(pictures, currentSlide, screenResolution)
            break;
        default:
            break;
    }
}
// get all
router.post('/', async (req, res) => {
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
    // fill pictures
    for (let index = 0; index < slides.length; index++) {
        // screenshot Slides
        if (slides[index].domain !== "")
        {
            if (!usedDomain.find(d => d === slides[index].domain) || slides[index].domain === 'AIGraphana') // Todo
            {
                usedDomain.push(slides[index].domain)
                await screenshotWebsite(pictures, slides, slides[index], req.body, res)
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