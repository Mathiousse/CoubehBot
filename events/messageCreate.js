
import Discord, { ButtonStyle } from "discord.js";
import { client } from "../index.js";
import { userCoubehStats, messagesCoubeds, leaderboardMessages } from "../database.js";
import { EmbedBuilder, ActionRowBuilder } from "discord.js";

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

    try {
        for (const word of coubehWords) {
            if (!message.content) continue
            if (slugify(message.content).includes(word)) {
                for (const messages of messagesCache[message.channelId]) {
                    if (messages.author.id === message.author.id) { continue }
                    if (regexPrankex.test(slugify(messages.content))) {
                        console.log(message.content)

                        const isMessagePresent = await messagesCoubeds.findOne({ where: { messageId: messages.id, guildId: message.guild.id } });
                        if (isMessagePresent) {
                            continue
                        }
                        await messagesCoubeds.upsert({ messageId: messages.id, coubedBy: messages.author.id, guildId: message.guild.id });
                        let userStats = await userCoubehStats.findOne({ where: { discordid: message.author.id, guildId: message.guild.id } })

                        if (!userStats) {
                            userStats = { discordid: message.author.id, username: message.author.globalName, quoicoubehCount: 1, guildId: message.guild.id }
                            userCoubehStats.upsert(userStats)
                        } else {
                            userStats.quoicoubehCount++
                            userStats.save()
                        }
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
                            let ranks = []
                            const generalStats = await userCoubehStats.findAll({ where: { guildId: message.guild.id } })
                            generalStats.forEach(stat => {
                                const discordid = stat.dataValues.discordid
                                const quoicoubehCount = stat.dataValues.quoicoubehCount
                                ranks.push({ discordid: discordid, quoicoubehCount: quoicoubehCount })
                            });
                            function compareByCount(a, b) {
                                return b.quoicoubehCount - a.quoicoubehCount;
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
    } catch (error) {
        console.error(`An error occurred: ${error}`);
    }
});

try {
    client.on("messageCreate", async (message) => {
        if (message.author.bot || message.channel.type === "DM") return;

        const linkRegex = /https?:\/\/\S+/;
        const linkMatch = message.content.match(linkRegex);
        if (linkMatch) {
            const link = linkMatch[0];
            const newLink = replaceLink(link);

            if (link !== newLink) {
                const choiceMessage = await message.reply({
                    content: message.author.toString(),
                    ...createChoiceMessage(message.author, newLink),
                });

                const collector = choiceMessage.createMessageComponentCollector({
                    filter: (interaction) => interaction.user.id === message.author.id,
                    time: 30000,
                });

                collector.on("collect", async (interaction) => {
                    if (interaction.customId === "yes") {
                        try {
                            await message.delete();
                            const newMessage = `${message.author} a envoyé le message :\`\`\`${message.content}\`\`\` Lien optimisé : :\n ${newLink}\n`
                            const newSentMessage = await message.channel.send(newMessage);
                            await newSentMessage.react("🗑️");

                            const reactionCollector = newSentMessage.createReactionCollector({
                                filter: (reaction, user) =>
                                    reaction.emoji.name === "🗑️" && user.id === message.author.id,
                                time: 30000,
                            });

                            reactionCollector.on("collect", async (reaction, user) => {
                                try {
                                    await newSentMessage.delete();
                                } catch (error) {
                                    console.error(error);
                                }
                            });
                        } catch (error) {
                            console.error(error);
                            await message.channel.send(
                                `Désolé, je n'ai pas pu supprimer votre message. Peut-être qu'il a déjà été supprimé ou qu'il est introuvable.`
                            );
                        }
                    }

                    collector.stop();
                    await choiceMessage.delete();
                });
            }
        }
    });
} catch (error) {
    console.error(`An error occurred: ${error}`);
}

function replaceLink(link) {
    if (link.includes("twitter.com/")) {
        return link.replace("twitter.com", "vxtwitter.com");
    } else if (link.includes("x.com/")) {
        return link.replace("x.com", "vxtwitter.com");
    } else if (link.includes("instagram.com/")) {
        return link.replace("instagram.com", "ddinstagram.com");
    } else if (link.includes("tiktok.com/")) {
        return link.replace("tiktok.com", "tiktxk.com");
    } else if (link.includes("reddit.com")) {
        return link.replace("reddit.com", "rxddit.com");
    } else {
        return link;
    }
}

function createChoiceMessage(user, link) {
    const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Voulez-vous remplacer votre message par un message contenant un lien optimisé pour Discord ?")
        .setFooter({
            text: `Demandé par ${user.tag}`,
            iconURL: user.displayAvatarURL(),
        });

    return {
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId("yes")
                    .setLabel("Oui")
                    .setStyle(ButtonStyle.Success),
                new Discord.ButtonBuilder()
                    .setCustomId("no")
                    .setLabel("Non")
                    .setStyle(ButtonStyle.Danger)
            ),
        ],
    };
}