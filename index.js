// db stuff
const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const quoicouCount = sequelize.define('quoicoucount', {
    discordid: {
        type: Sequelize.STRING,
        unique: true,
    },
    username: {
        type: Sequelize.STRING,
        unique: true,
    },
    usage_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
});

// discord stuff

require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', readyClient => {
    quoicouCount.sync({ force: true });
    console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (/quoi((?= ?\?+$|\!+$)|$)/g.test(message.content)) {
        console.log(`Reacting to message: ${message.content}`);
        console.log(message.author.globalName)
        console.log(message.author.id)
        const user = await quoicouCount.findOne({ where: { discordid: message.author.id } })
        console.log(user)
        message.react('😹')
    } else {
        console.log(`Not reacting to message: ${message.content}`);
    }
}
)

client.login(process.env.DISCORD_TOKEN)