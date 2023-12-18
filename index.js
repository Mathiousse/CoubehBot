require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`Bot is connected as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
    console.log(`Received message: ${message.content}`)
    // Check if the message content matches the regular expression
    if (/quoi\s/g.test(message.content)) {
        console.log(`Reacting to message: ${message.content}`);
        // React with an emote
        message.react('😹') // replace '😹' with the Unicode of the emote you want to react with
            .catch(error => console.error(`Couldn't react to message: `, error));
    }
});

client.on('messageCreate', message => {
    console.log('messageCreate event triggered');
});


client.login(process.env.DISCORD_TOKEN)
    .catch(error => console.error(`Couldn't log in: `, error));
