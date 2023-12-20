
import { client } from "../index.js"
import { userCoubehStats, messagesCoubeds } from "../database.js";

let messagesCache = {}
const coubehWords = ["feur", "coubeh"]
const regexPrankex = /quoi((?= ?\?+$|\!+$)|$)/g
client.on('messageCreate', async message => {
    if (!messagesCache[message.channelId]) {
        messagesCache[message.channelId] = [message];
    } else {
        messagesCache[message.channelId].push(message);
    }
    if (messagesCache[message.channelId].length > 10) {
        messagesCache[message.channelId].shift();
    }
    for (const word of coubehWords) {
        if (message?.content?.includes(word)) {
            for (const messages of messagesCache[message.channelId]) {
                if (regexPrankex.test(messages.content.toLowerCase())) {
                    const isMessagePresent = await messagesCoubeds.findOne({ where: { messageId: messages.id } });
                    if (isMessagePresent) { break }
                    // messages.react('😹');
                    await messagesCoubeds.upsert({ messageId: messages.id, coubedBy: messages.author.id });
                    const userStats = await userCoubehStats.findOne({ where: { discordid: message.author.id } })
                    if (!userStats) {
                        const userStats = { discordid: message.author.id, username: message.author.globalName, quoicoubehCount: 1 }
                        userCoubehStats.upsert(userStats)
                    } else {
                        userStats.quoicoubehCount++
                        userStats.save()
                    }
                    console.log(`${message.author.globalName} won 1 point for coubeh-ing`)
                    message.react('👏')
                    if (typeof leaderboardMessage !== 'undefined') {
                        const embed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle('Leaderboard')
                            .setDescription('This is the updated leaderboard');
                        // Add fields to the embed based on your updated leaderboard data

                        await leaderboardMessage.edit({ embeds: [embed] });
                    }
                }
            }
        }
    }
}
)

client.on("messageCreate", async message => {
    let ranks = []
    if (message.content.includes("ranks")) {
        const generalStats = await userCoubehStats.findAll()
        generalStats.forEach(stat => {
            const name = stat.dataValues.username
            const quoicoubehCount = stat.dataValues.quoicoubehCount
            ranks.push({ name: name, quoicoubehCount: quoicoubehCount })
        });
        function compareByCount(a, b) {
            return a.quoicoubehCount - b.quoicoubehCount;
        }
        ranks.sort(compareByCount);
        console.log(ranks)
        let messageToSend = ""

        ranks.forEach(rank => {
            messageToSend += `@${rank.name}: ${rank.quoicoubehCount}\n`
        });
        if (ranks.length !== 0) message.reply(messageToSend)

    }
})