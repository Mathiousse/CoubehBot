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

const coubehWords = ["feur", "coubeh"]
const regexPrankex = /quoi((?= ?\?+$|\!+$)|$)/g

client.once('ready', readyClient => {
    userCoubehStats.sync({ force: true });
    messagesCoubeds.sync({ force: true })
    console.log(`Logged in as ${readyClient.user.tag}!`);
});

let messagesCache = {}

client.on('messageCreate', async message => {
    if (!messagesCache[message.channelId]) {
        messagesCache[message.channelId] = [message];
    } else {
        messagesCache[message.channelId].push(message);
    }
    if (messagesCache[message.channelId].length > 10) {
        messagesCache[message.channelId].shift();
    }

    // const messageContent = messagesCache[message.channelId][messagesCache[message.channelId].length - 1].content

    // This is the check on every message for 'quoi'
    // if (regexPrankex.test(messageContent.toLowerCase())) {
    // const userStats = await userCoubehStats.findOne({ where: { discordid: message.author.id } })
    // if (!userStats) {
    //     const userStats = { discordid: message.author.id, username: message.author.globalName, quoicoubehCount: 1 }
    //     userCoubehStats.upsert(userStats)
    // } else {
    //     userStats.quoicoubehCount++
    //     userStats.save()
    // }
    // message.react('<:quoicoubeh:1176956334336389211>')
    // }

    for (const word of coubehWords) {
        if (message?.content?.includes(word)) {
            for (const messages of messagesCache[message.channelId]) {
                if (regexPrankex.test(messages.content.toLowerCase())) {
                    const isMessagePresent = await messagesCoubeds.findOne({ where: { messageId: messages.id } });
                    if (!isMessagePresent) {
                        messages.react('😹');
                        await messagesCoubeds.upsert({ messageId: messages.id, coubedBy: messages.author.id });
                        const userStats = await userCoubehStats.findOne({ where: { discordid: message.author.id } })
                        if (!userStats) {
                            const userStats = { discordid: message.author.id, username: message.author.globalName, quoicoubehCount: 1 }
                            userCoubehStats.upsert(userStats)
                        } else {
                            userStats.quoicoubehCount++
                            userStats.save()
                        }
                        console.log(`${messages.author.globalName} won 1 point for coubeh-ing`)
                    }
                }
            }
        }
    }
}
)