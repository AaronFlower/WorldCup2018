// Get FIFA-sanctioned matches.

require('dotenv').config()

let fromYear = process.env.FROM_YEAR || 2014
let toYear = process.env.TO_YEAR || 2017


const fs = require('fs')
const axios = require('axios')
const mkdirp = require('mkdirp')
const FIFA_URL = 'http://data.fifa.com/livescores/en/internationaltournaments/matches/m/bydaterange'

const getOneYearMatches = function (year) {
    let folder = 'data/matches'
    let fileName = `${year}-matches.json`
    let filePath = `${folder}/${fileName}`
    let url = `${FIFA_URL}/${year}-01-01/${year}-12-31`

    if (fs.existsSync(filePath)) {
        console.log(`${fileName} exists.`)
    }

    mkdirp.sync(folder)

    axios.get(url).then(
        res => {
            if (res.status === 200) {
                let data = res.data
                let jsonData = data.replace('_matchesByDateRangeCallback(', '').replace('})','}')
                fs.writeFileSync(filePath, jsonData)
                console.log(`Fetched ${fileName}`)
            } else {
                console.log(`Can not fetch the data to ${fileName}`)
                console.error(fileName + ': error ' + res.status)
            }
        },
        err => {
            console.error(fileName, err)
        }
    ).catch (err => console.log(fileName, err))
}

for (let year = fromYear; year <= toYear; ++year) {
    getOneYearMatches(year)
}
