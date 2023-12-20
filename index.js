import 'dotenv/config'
import pkg from 'discord.js';
const { Client, GatewayIntentBits } = pkg;


export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.MessageContent
    ]
});


client.once('ready', readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
    import("./events/ready.js");
    import("./events/messageCreate.js");
    import("./events/interactionCreate.js");
});


client.once('ready', async () => {
    const data = {
        name: 'leaderboard',
        description: 'Post the leaderboard to a specific channel',
        options: [{
            name: 'channel',
            type: 7,
            description: 'The channel to post the leaderboard',
            required: true,
        }],
    };

    // Register the command for a specific guild
    const guildId = '827578591885131827'; // Replace with your guild ID
    const guild = client.guilds.cache.get(guildId);
    const command = await guild?.commands.create(data);
    console.log(`Registered command: ${command?.name}`);
});


client.login(process.env.DISCORD_TOKEN)