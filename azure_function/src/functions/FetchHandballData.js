const { app } = require('@azure/functions');
const { BlobServiceClient } = require("@azure/storage-blob");
const fetch = require('node-fetch');

app.timer('FetchHandballData', {
    schedule: '0 00 18 * * 6,0',
    handler: async (_myTimer, context) => {
        context.log(`Starting scheduled function`);
        const city = process.env["TEAM_CITY"];
        const url = process.env["QUERY_URL"];
        const baWue = process.env["TEAM_REGION_BAWUE"];
        const orgBodensee = process.env["TEAM_ORG_BODENSEE_DONAU"];
        const storage = process.env["AzureWebJobsStorage"];
        const containerName = process.env["STORAGE_CONTAINER_NAME"];

        const now = new Date();
        const mondayOfThisWeek = getDateOfMonday(now);
        const query = getQuery(mondayOfThisWeek, url, orgBodensee, baWue);
        const allDates = await getMatchDates(query);
        const allGames = await getAllGames(allDates);
        const gamesOfTeam = await getAllGamesOfTeam(allGames, city);
        const nextMatchPerTeam = getNextMatches(now, gamesOfTeam);

        const containerClient = getContainerClient(storage, containerName);
        storeInContainer(containerClient, gamesOfTeam, 'allgames.json');
        storeInContainer(containerClient, nextMatchPerTeam, 'nextgames.json');
    }
});

async function getAllGamesOfTeam(allGames, city) {
    const teamLA = `TSV ${city}`;

    let gamesOfTeam = allGames
        .flatMap(json => json[0].content.classes)
        .filter(c => c.games.length > 0)
        .flatMap(c => extractGameData(c.games, c.gClassSname))
        .filter(game => game.HomeTeam.startsWith(teamLA) || game.GuestTeam.startsWith(teamLA))
        .map(element => createGameData(element, city));
    return gamesOfTeam;
}

async function getAllGames(allDates) {
    const urls = allDates.map(date => getQuery(date));
    const requests = urls.map((url) => fetch(url).then(response => response.json()));
    const allGames = await Promise.all(requests);
    return allGames;
}

async function getMatchDates(query) {
    return await fetch(query)
        .then(response => { return response.json(); })
        .then(json => { console.log(json); return json; })
        .then(json => { return json[0].menu.dt.list; })
        .then(dates => Object.getOwnPropertyNames(dates));
}

function getQuery(date, url, orgBodenseeDonau, baWue) {
    return `${url}do=${date}&cmd=po&og=${baWue}&o=${orgBodenseeDonau}`;
}

function extractGameData(games, league) {
    return games.map(game => {
        return {
            Team: league,
            HomeTeam: game.gHomeTeam,
            GuestTeam: game.gGuestTeam,
            HomeGoals: game.gHomeGoals,
            GuestGoals: game.gHomeGoals_1,
            Date: game.gDate,
            Time: game.gTime,
            WeekDay: game.gWDay,
            Town: game.gGymnasiumTown
        }
    });
}

function createGameData(element, city) {
    const teamLA = `TSV ${city}`;
    const dateTime = getDateTime(element.Date, element.Time);
    const homeGame = element.HomeTeam.startsWith(teamLA);
    const n = homeGame ? element.HomeTeam : element.GuestTeam;
    const teamNames = mapTeamName(element.Team, n);
    return {
        team: element.Team,
        teamname: teamNames.long,
        shortteamname: teamNames.short,
        upperteamname: teamNames.upper,
        home: homeGame ? element.HomeTeam : element.GuestTeam,
        opponent: homeGame ? element.GuestTeam : element.HomeTeam,
        goals: homeGame ? element.HomeGoals : element.GuestGoals,
        opponentgoals: homeGame ? element.HomeGoals : element.HomeGoals,
        date: element.Date,
        dateCompare: dateTime,
        day: element.WeekDay,
        time: element.Time,
        matchtype: element.Town == city ? "H" : "A",
        match: `${element.HomeTeam} vs ${element.GuestTeam}`,
        place: `in ${element.Town}`
    };
}

function getDateOfMonday(now) {
    const mondayDate = new Date(now);
    mondayDate.setDate(now.getDate() - (now.getDay() + 6) % 7); // Go back to Monday
    const mondayOfThisWeek = mondayDate.toISOString().split('T')[0];
    return mondayOfThisWeek;
}

function mapTeamName(team, teamname) {
    switch (team) {
        case 'M-KLA-D':
            return { short: 'M1', long: 'Männer 1', upper: 'MÄNNER 1' };
        case 'M-KLB-D':
            return { short: 'M2', long: 'Männer 2', upper: 'MÄNNER 2' };
        case 'F-KLA-D':
            if (teamname == 'TSV Laichingen 2')
                return { short: 'D2', long: 'Damen 2', upper: 'DAMEN 2' };
            else
                return { short: 'D1', long: 'Damen 1', upper: 'DAMEN 1' };
        case 'gJD-KLC-1':
            return { short: 'gD', long: 'Gemischte D-Jugend', upper: 'gD-JUGEND' };
        case 'wJB-KL-1':
            return { short: 'wB', long: 'Weibliche B-Jugend', upper: 'wB-JUGEND' };
        case 'gJE-6+1':
            return { short: 'gE', long: 'Gemischte E-Jugend', upper: 'gE-JUGEND' };
        case 'mJB-KL-1':
            return { short: 'mB', long: 'Männliche B-Jugend', upper: 'mB-JUGEND' };
        case 'mJC-KLC-1':
            return { short: 'mC', long: 'Männliche C-Jugend', upper: 'mC-JUGEND' };
        case 'gJF-1':
            return { short: 'gF', long: 'Gemischte F-Jugend', upper: 'gF-JUGEND' };
        case 'F-Pok-B':
            return { short: 'wP', long: 'Pokalspiel D1', upper: 'DAMEN 1 (POKAL)' };
        default:
            return { short: '', long: team, upper: team };
    }
}

function getDateTime(date, time) {
    const dateComponents = date.split('.');
    const day = parseInt(dateComponents[0], 10);
    const month = parseInt(dateComponents[1], 10);
    const monthIndex = month - 1;
    const year = parseInt("20" + dateComponents[2], 10);
    const timeComponents = time.split(':');
    const hours = parseInt(timeComponents[0], 10);
    const minutes = parseInt(timeComponents[1], 10);
    return new Date(year, monthIndex, day, hours, minutes);
}


function getNextMatches(now, gamesOfTeam) {
    const in15Days = new Date(now);
    in15Days.setDate(now.getDate() + 60);
    const nextGames = gamesOfTeam
        .filter(game => game.dateCompare >= now && game.dateCompare <= in15Days)
        .reduce((accumulator, match) => {
            const id = `${match.team}-${match.home}`;
            if (!accumulator.has(id) || new Date(match.dateCompare) < new Date(accumulator.get(id).dateCompare)) {
                accumulator.set(id, match);
            }
            return accumulator;
        }, new Map());

    const nextMatchesArray = Array.from(nextGames.values())
        .sort((a, b) => new Date(a.dateCompare) - new Date(b.dateCompare));
    return nextMatchesArray;
}

function storeInContainer(containerClient, data, name) {
    containerClient
        .getBlockBlobClient(name)
        .upload(JSON.stringify(data), JSON.stringify(data).length);
}

function getContainerClient(storage, containerName) {
    return BlobServiceClient
        .fromConnectionString(storage)
        .getContainerClient(containerName);
}

module.exports = {
    getDateTime,
    mapTeamName,
    getNextMatches,
    getDateOfMonday,
    getAllGames,
    getMatchDates,
    getAllGamesOfTeam,
    getContainerClient,
    storeInContainer
};