const { app } = require('@azure/functions');
const { BlobServiceClient } = require("@azure/storage-blob");
const fetch = require('node-fetch');

app.timer('FetchHandballData', {
    schedule: '0 00 23 * * 4',
    handler: async (myTimer, context) => {
        context.log(`Starting scheduled function`);

        const city = "Laichingen"
        const now = new Date();
        const mondayOfThisWeek = getDateOfMonday(now);
        let allDates = await getMatchDates(mondayOfThisWeek);
        const allGames = await getAllGames(allDates);

        const teamLA = `TSV ${city}`
        let gamesOfTeam = allGames
            .flatMap(json => json[0].content.classes)
            .filter(c => c.games.length > 0)
            .map(c => {
                c.games.forEach(game => game.team = c.gClassSname);
                return c;
            })
            .flatMap(c => c.games)
            .filter(game => game.gHomeTeam.startsWith(teamLA) || game.gGuestTeam.startsWith(teamLA))
            .map(element => {
                const teamNames = mapTeamName(element.team);
                const homeGame = element.gHomeTeam.startsWith(teamLA);
                const dateTime = getDateTime(element.gDate, element.gTime);
                return {
                    team: element.team,
                    teamname: teamNames.long,
                    shortteamname: teamNames.short,
                    upperteamname: teamNames.upper,
                    home: homeGame ? element.gHomeTeam : element.gGuestTeam,
                    opponent: homeGame ? element.gGuestTeam : element.gHomeTeam,
                    goals: homeGame ? element.gHomeGoals : element.gHomeGoals_1,
                    opponentgoals: homeGame ? element.gHomeGoals_1 : element.gHomeGoals,
                    date: element.gDate,
                    dateCompare: dateTime,
                    day: element.gWDay,
                    time: element.gTime,
                    matchtype: element.gGymnasiumTown == city ? "H" : "A",
                    match: `${element.gHomeTeam} vs ${element.gGuestTeam}`,
                    place: `in ${element.gGymnasiumTown}`
                };
            });

        const nextMatchesArray = getNextMatches(now, gamesOfTeam);

        const containerClient = getContainerClient();
        storeInContainer(containerClient, gamesOfTeam, 'allgames.json');
        context.log('all games stored successfully.');
        storeInContainer(containerClient, nextMatchesArray, 'nextgames.json');
        context.log('next games stored successfully.');
    }
});

async function getAllGames(allDates) {
    const urls = allDates.map(date => getQuery(date));
    const requests = urls.map((url) => fetch(url).then(response => response.json()));
    const allGames = await Promise.all(requests);
    return allGames;
}

async function getMatchDates(mondayOfThisWeek) {
    return await fetch(getQuery(mondayOfThisWeek))
        .then(response => { return response.json(); })
        .then(json => { return json[0].menu.dt.list; })
        .then(dates => Object.getOwnPropertyNames(dates));
}

function getQuery(date) {
    const url = 'https://spo.handball4all.de/service/if_g_json.php?';
    const orgBodenseeDonau = "12";
    const baWue = "3";
    return `${url}do=${date}&cmd=po&og=${baWue}&o=${orgBodenseeDonau}`;
}

function getDateOfMonday(now) {
    const mondayDate = new Date(now);
    mondayDate.setDate(now.getDate() - (now.getDay() + 6) % 7); // Go back to Monday
    const mondayOfThisWeek = mondayDate.toISOString().split('T')[0];
    return mondayOfThisWeek;
}

function mapTeamName(team) {
    switch (team) {
        case 'M-KLA-D':
            return { short: 'M1', long: 'Männer 1', upper: 'MÄNNER 1' };
        case 'M-KLB-D':
            return { short: 'M2', long: 'Männer 2', upper: 'MÄNNER 2' };
        case 'F-KLA-D':
            return { short: 'D1', long: 'Damen 1', upper: 'DAMEN 1' };
        case 'F-KLB-D':
            return { short: 'D2', long: 'Damen 2', upper: 'DAMEN 2' };
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
    const in10Days = new Date(now);
    in10Days.setDate(now.getDate() + 10);
    const nextGames = gamesOfTeam
        .filter(game => game.dateCompare >= now && game.dateCompare <= in10Days)
        .reduce((accumulator, match) => {
            const id = `${match.team}-${match.home}`;
            if (!accumulator.has(id) || new Date(match.dateCompare) > new Date(accumulator.get(id).dateCompare)) {
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

function getContainerClient() {
    return BlobServiceClient
        .fromConnectionString(process.env["AzureWebJobsStorage"])
        .getContainerClient(process.env["STORAGE_CONTAINER_NAME"]);
}