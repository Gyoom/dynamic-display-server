require('dotenv').config()
const puppeteer = require('puppeteer')

const MYREPORT_LOGIN = process.env.MYREPORT_LOGIN
const MYREPORT_PASSWORD = process.env.MYREPORT_PASSWORD

const screenshot = async (currentSlide, screenResolution, res) => {
    const browser = await puppeteer.launch({ headless: "new" })
    const page = await browser.newPage()

    await page.setViewport({
        width: 1920,
        height: 900,
        deviceScaleFactor: 1
    })
    

    // connect to alphaInnovationPage
    await page.goto(
        'http://srvfactorytrack.wavnet.be:8080/project/ALPHA%20INNOVATIONS/dashboard/Dashboards_b796601b-c5be-4061-94f6-341012dc9291/view',
        {
            waitUntil: "networkidle0",
        }
    )

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
        await browser.close();
        return ""
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
        return
    })
    
    // find correponding tag
    for (let y = 0; y < childrens.length; y++) {
        if (childrens[y] === currentSlide.webpagePathData)
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
            
            await browser.close()

            return "data:image/jpg;base64, " + screenshotBuffer
        }
    }

    await browser.close()
    return ""
}

exports.screenshot = screenshot