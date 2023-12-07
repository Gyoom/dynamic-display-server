const myReport = require('./myReport')
const grafana = require('./grafana')

const select = async (currentSlide, res) => {
    switch (currentSlide.domain) {
        case 'AIMyReport':
            return await myReport.screenshot(currentSlide, res)
        case "AIGraphana":
            return await grafana.screenshot(currentSlide, res)
        default:
            break;
    }
}

exports.select = select