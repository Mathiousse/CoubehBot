
import { client } from "../index.js"
import { userCoubehStats, messagesCoubeds, leaderboardMessages } from "../database.js";
import { EmbedBuilder } from "discord.js";

let messagesCache = {}
const coubehWords = ["feur", "coubeh"]
const regexPrankex = /quoi((?= ?\?+$|\!+$)|$)/g

const slugify = (text) => {
    return text
        .toString()                   // Cast to string (optional)
        .normalize('NFKD')            // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
        .toLowerCase()                // Convert the string to lowercase letters
        .trim()                       // Remove whitespace from both sides of a string (optional)
        .replace(/\s+/g, '-')         // Replace spaces with -
        .replace(/[^\w\-]+/g, '')     // Remove all non-word chars
        .replace(/\_/g, '-')           // Replace _ with -
        .replace(/\-\-+/g, '-')       // Replace multiple - with single -
        .replace(/\-$/g, '');         // Remove trailing -
}

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.channel.type === 'DM') return;

    if (!messagesCache[message.channelId]) {
        messagesCache[message.channelId] = [message];
    } else {
        messagesCache[message.channelId].push(message);
    }
    if (messagesCache[message.channelId].length > 10) {
        messagesCache[message.channelId].shift();
    }

    for (const word of coubehWords) {
        if (!message.content) continue
        if (message.content.includes(word)) {
            for (const messages of messagesCache[message.channelId]) {
                if (messages.author.id === message.author.id) { continue }
                if (regexPrankex.test(slugify(messages.content))) {
                    const isMessagePresent = await messagesCoubeds.findOne({ where: { messageId: messages.id, guildId: message.guild.id } });
                    if (isMessagePresent) {
                        continue
                    }
                    await messagesCoubeds.upsert({ messageId: messages.id, coubedBy: messages.author.id, guildId: message.guild.id });
                    const userStats = await userCoubehStats.findOne({ where: { discordid: message.author.id, guildId: message.guild.id } })

                    if (!userStats) {
                        const userStats = { discordid: message.author.id, username: message.author.globalName, quoicoubehCount: 1, guildId: message.guild.id }
                        userCoubehStats.upsert(userStats)
                    } else {
                        userStats.quoicoubehCount++
                        userStats.save()
                    }

                    console.log(`${message.author.globalName} won 1 point for coubeh-ing`)
                    message.react('👏')

                    const leaderboardMessageRecord = await leaderboardMessages.findOne({ where: { guildId: message.guild.id } });
                    if (leaderboardMessageRecord) {
                        const channel = client.channels.cache.get(leaderboardMessageRecord.channelId);
                        let leaderboardMessage
                        try {
                            leaderboardMessage = await channel.messages.fetch(leaderboardMessageRecord.messageId);
                        } catch (error) {
                            console.error(`Failed to fetch message: ${error}`);
                        }
                        // const leaderboardMessage = await channel.messages.fetch(leaderboardMessageRecord.messageId);

                        // Recreate the embed with the updated leaderboard data
                        let ranks = []
                        const generalStats = await userCoubehStats.findAll({ where: { guildId: message.guild.id } })
                        generalStats.forEach(stat => {
                            const discordid = stat.dataValues.discordid
                            const quoicoubehCount = stat.dataValues.quoicoubehCount
                            ranks.push({ discordid: discordid, quoicoubehCount: quoicoubehCount })
                        });
                        function compareByCount(a, b) {
                            return a.quoicoubehCount + b.quoicoubehCount;
                        }
                        ranks.sort(compareByCount);
                        const embed = new EmbedBuilder()
                            .setTitle('Leaderboard')
                            .setDescription('This is the leaderboard');
                        embed.addFields(
                            {
                                name: 'Utilisateur',
                                value: ranks.map(rank => "<@" + rank.discordid + ">").join("\n"),
                                inline: true
                            },
                            {
                                name: '\u200B',
                                value: '\u200B',
                                inline: true
                            },
                            {
                                name: 'QuoicouCount',
                                value: ranks.map(rank => rank.quoicoubehCount.toString()).join("\n"),
                                inline: true
                            },
                            {
                                name: 'Dernier quoicoubeur',
                                value: "<@" + message.author.id + ">",
                                inline: true
                            },
                            {
                                name: '\u200B',
                                value: '\u200B',
                                inline: true
                            },
                            {
                                name: 'Quand',
                                value: `<t:${Math.floor(message.createdTimestamp / 1000)}:R>`,
                                inline: true
                            }
                        );
                        await leaderboardMessage.edit({ embeds: [embed] });
                    }
                } else {
                    console.log("no match for word '" + word, messages.content.toLowerCase(), "'")
                }
            }
        }
    }
}
)