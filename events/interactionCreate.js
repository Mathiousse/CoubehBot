import { client } from "../index.js"
import { userCoubehStats } from "../database.js";
import { EmbedBuilder } from "discord.js";
import { leaderboardMessages } from "../database.js";

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    // Fetch all global commands
    const commands = await client.application.commands.fetch();
    // Delete all commands
    for (const command of commands.values()) {
        await client.application.commands.delete(command.id);
    }
    let ranks = []
    const { commandName } = interaction;
    if (commandName === 'leaderboard') {
        const channel = interaction.options.getChannel('channel');
        const guildId = interaction.guild.id;
        const generalStats = await userCoubehStats.findAll({ where: { guildId: guildId } })
        generalStats.forEach(stat => {
            const name = stat.dataValues.username
            const quoicoubehCount = stat.dataValues.quoicoubehCount
            ranks.push({ name: name, quoicoubehCount: quoicoubehCount })
        });
        function compareByCount(a, b) {
            return a.quoicoubehCount - b.quoicoubehCount;
        }
        ranks.sort(compareByCount);
        const embed = new EmbedBuilder()
            .setTitle('Leaderboard')
            .setDescription('This is the leaderboard');
        embed.addFields({
            name: 'Utilisateur',
            value: ranks.length > 0 ? ranks.map(rank => rank.name).join("\n") : 'No data',
            inline: true
        })
        embed.addFields({
            name: 'QuoicouCount',
            value: ranks.length > 0 ? ranks.map(rank => rank.quoicoubehCount.toString()).join("\n") : 'No data',
            inline: true
        })

        const leaderboardMessage = await channel.send({ embeds: [embed] });
        await leaderboardMessages.upsert({ guildId: guildId, messageId: leaderboardMessage.id, channelId: channel.id });
        await interaction.reply({ content: 'Posted the leaderboard!', ephemeral: true });
    }
});