const json2csv = require('json2csv')
const fs = require('fs')

const data = require('./data/processed/matches.json') 


try {
    fs.writeFileSync('./data/processed/matches.csv', json2csv.parse(data))
} catch (err) {
    console.log(err)
}

console.log('done.')

