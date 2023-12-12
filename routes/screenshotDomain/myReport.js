require('dotenv').config()
const puppeteer = require('puppeteer')

const MYREPORT_LOGIN = process.env.MYREPORT_LOGIN
const MYREPORT_PASSWORD = process.env.MYREPORT_PASSWORD

const screenshot = async (currentSlide, screenResolution) => {
    const browser = await puppeteer.launch({ headless: "new" })
    const page = await browser.newPage()
    
    await page.setViewport({
        width: 1920,
        height: 900,
        deviceScaleFactor: 1
    })

    // login
    await page.goto('http://srvfactorytrack.wavnet.be:8080/auth/Account/Login?ReturnUrl=%2Fauth%2Fconnect%2Fauthorize%2Fcallback%3Fresponse_type%3Did_token%2520token%26client_id%3Dcenter_client%26state%3DWWpmcU0wLWtia0JpY2R1MVpEMG5qaEhZdWVyVE1uUmh6NUZiREJRR0pwMElx%26redirect_uri%3Dhttp%253A%252F%252Fsrvfactorytrack.wavnet.be%253A8080%252Findex%26scope%3Dopenid%2520profile%2520email%2520user_license%2520project_read%2520dashboard_read%26nonce%3DWWpmcU0wLWtia0JpY2R1MVpEMG5qaEhZdWVyVE1uUmh6NUZiREJRR0pwMElx')
    await page.waitForNetworkIdle()

    await page.type('#Username', MYREPORT_LOGIN)
    await page.click('body > div > div > div > form > fieldset > button')
    await page.waitForNetworkIdle()
    
    await page.type('#Password', MYREPORT_PASSWORD)
    await page.click('body > div > div > div > form > fieldset > button')

    await page.goto('http://srvfactorytrack.wavnet.be:8080/project/ALPHA%20INNOVATIONS/dashboard/Dashboards_b796601b-c5be-4061-94f6-341012dc9291/view')

    await page.waitForSelector('body > app-root > div > app-navigation > div > app-dashboard-vue > div > div > div > dx-menu > div > ul')

    // get tabs
    const childrens = await page.evaluate(async () => {
        const names = []
        var elements = await document.querySelector('body > app-root > div > app-navigation > div > app-dashboard-vue > div > div > div > dx-menu > div > ul')
        for (element of elements.children) {
            var beginIndex = element.innerHTML.indexOf("class=\"ng-tns-c119-0\">")
            var endIndex =  element.innerHTML.indexOf("</span></div></div></div>")
            names.push(element.innerHTML.substring(beginIndex + 22, endIndex));
        }

        return names;
    }).catch(e => {
        browser.close()
        console.log('error : ', e)
        return
    })
    
    // find correponding tag
    for (let y = 0; y < childrens.length; y++) {
        if (childrens[y] === currentSlide.webpagePathData)
        {
            y = y + 1
            await page.click(
                'body > app-root > div > app-navigation > div > app-dashboard-vue > div > div > div > dx-menu > div > ul > li:nth-child(' + y + ') > div')
            await page.waitForNetworkIdle()
            const screenshotBuffer = await page.screenshot({ encoding: 'base64', type:'jpeg', quality:100, fullPage: true });
            
            await browser.close()

            return "data:image/jpg;base64, " + screenshotBuffer
        }
    }

    await browser.close()
    return ""
}

exports.screenshot = screenshot