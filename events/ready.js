
import { client } from "../index.js"
import { userCoubehStats, messagesCoubeds } from "../database.js";

client.once('ready', async (readyClient) => {
    userCoubehStats.sync({ force: true });
    messagesCoubeds.sync({ force: true })
    console.log(`Logged in as ${readyClient.user.tag}!`);

    const data = {
        name: 'leaderboard',
        description: 'Post the leaderboard to a specific channel',
        options: [{
            name: 'channel',
            type: 'CHANNEL',
            description: 'The channel to post the leaderboard',
            required: true,
        }],
    };

    // Replace 'GUILD_ID' with the ID of your guild
    const command = await client.guilds.cache.get('827578591885131827')?.commands.create(data);
    //   const command = await client.application?.commands.create(data);
    console.log(`Registered command: ${command?.name}`);
});