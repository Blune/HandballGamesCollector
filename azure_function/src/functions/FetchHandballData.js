const { app } = require('@azure/functions');

app.timer('FetchHandballData', {
    schedule: '0 0 22 * * 0',
    handler: async (myTimer, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const now = new Date();
        const mondayDate = new Date(now);
        mondayDate.setDate(now.getDate() - (now.getDay() + 6) % 7); // Go back to Monday
        const mondayOfThisWeek = mondayDate.toISOString().split('T')[0];

        const url = 'https://spo.handball4all.de/service/if_g_json.php?'
        const orgBodenseeDonau = "12";
        const baWue = "3";
        const query = "do=" + mondayOfThisWeek + "&cmd=po&og=3&o=" + orgBodenseeDonau
        const team = "TSV Laichingen";

        let allDates = await fetch(url + query)
            .then(response => { return response.json() })
            .then(json => { return json[0].menu.dt.list })
            .then(dates => Object.getOwnPropertyNames(dates));

        context.log(`all dates fetched: "${allDates.length}"`);

        const urls = allDates.map(date => `${url}do=${date}&cmd=po&og=${baWue}&o=${orgBodenseeDonau}`);
        const requests = urls.map((url) => fetch(url).then(response => response.json()));
        const allGames = await Promise.all(requests);

        let gamesOfTeam = allGames
            .flatMap(json => json[0].content.classes)
            .filter(c => c.games.length > 0)
            .map(c => {
                c.games.forEach(game => game.team = c.gClassSname);
                return c;
            })
            .flatMap(c => c.games)
            .filter(game => game.gHomeTeam.startsWith(team) || game.gGuestTeam.startsWith(team))
            .map(element => {
                const dateComponents = element.gDate.split('.');
                const day = parseInt(dateComponents[0], 10);
                const month = parseInt(dateComponents[1], 10);
                const monthIndex = month-1;
                const year = parseInt("20" + dateComponents[2], 10);
                return {
                    team: element.team,
                    home: element.gHomeTeam.startsWith(team) ? element.gHomeTeam : element.gGuestTeam,
                    opponent: element.gHomeTeam.startsWith(team) ? element.gGuestTeam : element.gHomeTeam,
                    goals: element.gHomeTeam.startsWith(team) ? element.gHomeGoals : element.gHomeGoals_1,
                    opponentgoals: element.gHomeTeam.startsWith(team) ? element.gHomeGoals_1 : element.gHomeGoals,
                    date: element.gDate,
                    dateCompare: new Date(year, monthIndex, day),
                    day: element.gWDay,
                    time: element.gTime,
                    match: `${element.gHomeTeam} vs ${element.gGuestTeam}`,
                    place: `in ${element.gGymnasiumTown}`
                };
            });

        const in10Days = new Date(now);
        in10Days.setDate(now.getDate() + 10);
        const nextGames = gamesOfTeam
            .filter(game => game.dateCompare >= now && game.dateCompare <= in10Days )
        
        const connectionString = process.env["AzureWebJobsStorage"]
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient('function');
        const blobClient = containerClient.getBlockBlobClient('allgames.json');
        await blobClient.upload(JSON.stringify(gamesOfTeam), JSON.stringify(gamesOfTeam).length);
        context.log('all games uploaded successfully.');

        const nextblobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const nextcontainerClient = nextblobServiceClient.getContainerClient('querydata');
        const nextblobClient = nextcontainerClient.getBlockBlobClient('nextgames.json');
        await nextblobClient.upload(JSON.stringify(nextGames), JSON.stringify(nextGames).length);
        context.log('next games uploaded successfully.');

        let result = gamesOfTeam.map(game => `${game.team}: ${game.match} ${game.place} ${game.day},${game.date} um ${game.time} Uhr`)
        return { body: `${result.join("\n")}` };
    }
});
