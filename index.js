import 'dotenv/config'
import pkg from 'discord.js';
const { Client, GatewayIntentBits } = pkg;
import { userCoubehStats, messagesCoubeds, leaderboardMessages } from "./database.js";

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

    await client.application.commands.create(data);
    userCoubehStats.sync();
    // userCoubehStats.sync({ force: true });
    messagesCoubeds.sync()
    // messagesCoubeds.sync({ force: true })
    leaderboardMessages.sync()
    // leaderboardMessages.sync({ force: true })

});


client.login(process.env.DISCORD_TOKEN)