console.clear();
require("events").setMaxListeners(10000);

const Database = require('mongoose')
Database.set('strictQuery', true)
const Discord = require("discord.js")
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.DirectMessages
    ],
    partials: [
        Discord.Partials.GuildScheduledEvent,
        Discord.Partials.Reaction,
        Discord.Partials.Message,
        Discord.Partials.User,
        Discord.Partials.Channel,
        Discord.Partials.GuildMember
    ]
})

const { token } = require("./config.json");

client.login(process.env.DISCORD_BOT_TOKEN || token)

Database.connect(process.env.MONGODB_URI || "mongodb+srv://hamoudidev32:Xg3yX5QCBPqimI5R@rp.wy3ofuo.mongodb.net/rpp?retryWrites=true&w=majority&appName=ABU")
    .then(() => console.log('Database Connected'))
    .catch((err) => console.log(err))

client.messageCommands = new Discord.Collection()
client.slashCommands = new Discord.Collection()

let handler = ["events", "slash", "message"]
handler.forEach(file => {
    require(`./handler/${file}`)(client);
})


process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});