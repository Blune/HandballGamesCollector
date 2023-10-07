const { app } = require('@azure/functions');

app.timer('FetchHandballData', {
    schedule: '0 0 22 * * 0',
    handler: (myTimer, context) => {
        context.log('Timer function processed request.');
    }
});
