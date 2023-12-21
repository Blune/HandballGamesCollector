const { app } = require('@azure/functions');
const { BlobServiceClient } = require("@azure/storage-blob");

app.timer('FetchHandballData', {
    schedule: '0 00 20 * * 6,0',
    handler: async (_myTimer, context) => {
        context.log(`Starting scheduled function`);
        const storage = process.env["AzureWebJobsStorage"];
        const containerName = process.env["STORAGE_CONTAINER_NAME"];

        const now = new Date();        
        const containerClient = getContainerClient(storage, containerName);        
        const gamesOfTeam = getDataFromContainer(containerClient, 'allgames.json')
        const nextMatchPerTeam = getNextMatches(now, gamesOfTeam);

        storeInContainer(containerClient, nextMatchPerTeam, 'nextgames2.json');
    }
});

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

function getDataFromContainer(containerClient, name) {
    containerClient
        .getBlockBlobClient(name)
        .download(0)
}

function getContainerClient(storage, containerName) {
    return BlobServiceClient
        .fromConnectionString(storage)
        .getContainerClient(containerName);
}

module.exports = {
    getNextMatches,
    getContainerClient,
    getDataFromContainer
};