import { client } from "../index.js"
import { userCoubehStats } from "../database.js";
import { EmbedBuilder } from "discord.js";

export embed
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    let ranks = []
    const { commandName } = interaction;

    if (commandName === 'leaderboard') {
        const channel = interaction.options.getChannel('channel');
        const embed = new EmbedBuilder()
            .setTitle('Leaderboard')
            .setDescription('This is the leaderboard');
        // Add fields to the embed based on your leaderboard data
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
        embed.addFields({
            name: 'Utilisateur',
            value: ranks.map(rank => rank.name).join("\n"),
            inline: true
        })
        embed.addFields({
            name: 'QuoicouCount',
            value: ranks.map(rank => rank.quoicoubehCount.toString()).join("\n"),
            inline: true
        })
        await channel.send({ embeds: [embed] });
        await interaction.reply({ content: 'Posted the leaderboard!', ephemeral: true });
    }
});