const fs = require('fs')
const mkdirp = require('mkdirp')

const cities = require('./data/cities.json')

const skippedTournaments = [
    'beach', 'fustal', 'u17', 'u-17', 'u20', 'u-20', 'club final',
    'club final', 'club world cup', 'club world championship', 'youth olympic'
]

let processedMatches = []

const processMatchFile = function (filename) {
    let contents = fs.readFileSync(filename)
    let jsonContent = JSON.parse(contents)

    for (let cid in jsonContent.competitionslist) {
        const competition = jsonContent.competitionslist[cid]

        let skipped = competition.isClubCompetition
        let name = competition.name.toLowerCase()
        let seoName = competition.name.toLowerCase()
        
        if (!skipped) {
            skipped = skippedTournaments.some(tour => name.indexOf(tour) !== -1 || seoName.indexOf(tour) !== -1)
        }
        if (skipped) {
            console.log(`Skipping ${name} ${seoName} ...\n`)
            continue
        }
        console.log(`Processing ${name} {seoName} ...\n`)
        processTournament(competition) 
    }
}

const processTournament = function (tournamentJson) {
   tournamentJson.matchlist.forEach(game => {
       if (game.isFinished) {
           let rawDate = game.matchDataUTC || game.matchDate
           let date = rawDate.substr(0, 10)
           
           let venue = ''
           if (game.venueName) {
               venue = game.venueName.trim()
               let cityData = cities.find(x => x.city === venue)
               if (cityData) {
                   venue = `${venue}, ${cityData.country}`
               }
           }

           let data = {
               date,
               team1: game.homeCountryCode,
               team1Text: game.homeTeamName,
               team2: game.awayCountryCode,
               team2Text: game.awayTeamName,
               venue,
               IdCupSeason: game.IdCupSeason,
               CupName: game.cupKindName,
               team1Score: game.scoreHome,
               team2Score: game.scoreAway
           }

           if (game.reasonWinCode === 3) {
               data['team1PenScore'] = game.scorePenaltyHome
               data['team2PenScore'] = game.scorePenaltyAway
               data['statText'] = 'Win on penalty'
               data['statText'] = `${game.scoreHome}-${game.scoreAway} (${game.scorePenaltyHome}-${game.scorePenaltyAway})` 
           } else {
               data['statText'] = ''
               data['statText'] = `${game.scoreHome}-${game.scoreAway}` 
           }

           processedMatches.push(data)
       }
   })
}

let path = './data/matches'
let files = fs.readdirSync(path)

files.forEach(file => processMatchFile(`${path}/${file}`))

mkdirp.sync('./data/processed/')
fs.writeFileSync('./data/processed/matches.json', JSON.stringify(processedMatches))

console.log('done.')
