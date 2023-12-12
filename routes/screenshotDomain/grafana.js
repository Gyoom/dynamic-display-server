require('dotenv').config()
const puppeteer = require('puppeteer')

const GRAFANA_LOGIN = process.env.GRAFANA_LOGIN
const GRAFANA_PASSWORD = process.env.GRAFANA_PASSWORD

const screenshot = async (currentSlide) => {
    const browser = await puppeteer.launch({ headless: 'new' })
    const page = await browser.newPage()

    try {

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
            await browser.close()
            return ""
        }

        await page.waitForNetworkIdle()
        await new Promise(r => setTimeout(r, 1000))

        const screenshotBuffer = await page.screenshot({ encoding: 'base64', type:'jpeg', quality:100 })
        await browser.close();

        return "data:image/jpg;base64, " + screenshotBuffer

    } catch (e) {
        browser.close()
        throw new Error('Grafana Puppeteer :', e.message)
    }
}

exports.screenshot = screenshot