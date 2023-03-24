/**
 * CoinGecko Token Pricebot
 * This bot tracks and displays current price of a CoinGecko listed token
 *   and displays it as its nickname.
 * 
 * There is only one permission needed for the bot
 *   and that is "change nickname" permission.
 * 
 * .env -> some config file data
 * index.js -> the bot
 * package.json -> build file
 * 
 */


// Environment variables
require('dotenv').config()
const currencySymbol = process.env['CURRENCY_SYMBOL']
const decimals = process.env['DECIMALS']
const updateFrequency = process.env['UPDATE_FREQUENCY']
const discordToken = process.env['DISCORD_TOKEN']
const tokenQueryID = process.env['TOKEN_QUERY_ID']
const queryURL = `${process.env['BASE_URL']}${tokenQueryID}`
const tickerDisplayID = process.env['TICKER_DISPLAY_ID']

// Simple keepalive webserver for Kaffeine/Uptimebot pings
//require('http').createServer(function (req, res) { res.end(`Server is up`) })
//    .listen(process.env.PORT || 3380)

// Date format
const datetime = new Date();
const strftime = require('strftime');
const strftimeLocal = strftime.timezone('+0800')

// JSON getter and parser
const axios = require(`axios`)


// Create Discord bot and connect it
const Eris = require(`eris`);
const client = new Eris(`Bot ${discordToken}`, { intents: ["guilds"] });
client.connect();

// Eris bot events
client.on(`ready`, () => {
    console.log(`------------------------`);
    console.log(`CONNECTION ESTABLISHED`);
    console.log(`Bot # ${client.user.id} connected`);
    console.log(`Logged in as "${client.user.username}"`);
});


// Create main method and run it
const mainf = function() {

    // Say hello
    console.log(`App is started at ${strftimeLocal('%Y-%m-%d %T', new Date())}`);

    // Run the functionality once...
    getPrices();

    // ...and then run repeatedly, until termination
    setInterval(getPrices, (updateFrequency * 1000 * 60));

}
mainf();


// Functionality method
function getPrices() {

    // New line
    console.log(`------------------------`);


    // Query to CoinGecko server
    axios.get(`${queryURL}`).then(res => {

        // If we got a valid response, process the data
        if (res.data && res.data[0].current_price && res.data[0].price_change_percentage_24h && res.data[0].last_updated) {

            let currentPrice = res.data[0].current_price || 0
            let priceChange = res.data[0].price_change_24h || 0
            let priceChangePercentage = res.data[0].price_change_percentage_24h || 0
            let queryDate = res.data[0].last_updated || '---'

            var priceDirection
            if (priceChange > 0) {
                priceDirection = `\u2197`
            } else if (priceChange < 0) {
                priceDirection = `\u2198`
            } else {
                priceDirection = `\u2192`
            }

            console.log(`${tickerDisplayID} is ${currencySymbol}${currentPrice} as of ${strftimeLocal('%Y-%m-%d %T', new Date())}`)

            // Construct the nickname then change bot's nickname (for each guild)
            // i.e. "BTC -> $50,123.50"
            client.guilds.forEach(function (guild, guildID) {

                options = {
                    nick: `${tickerDisplayID} ${priceDirection} ${currencySymbol}${currentPrice.toFixed(decimals)}`
                }

                client.editGuildMember(guildID, `@me`, options)

                console.log(`Updated ${guildID} (${guild.name})`)

            });

            // Construct the presence then change bot's nickname (for all guilds)
            // i.e. "Watching -3500.25 (-1.03%)"
            activities = [{
                name: `${priceChange.toFixed(decimals)} (${priceChangePercentage.toFixed(2)}%)`,
                type: 3
            }]
            client.editStatus(`online`, activities)

        } else {

            console.log(`Could not load price data for ${tokenQueryID}`)

        }

    }).catch(err => console.log('Error:', err))

}
