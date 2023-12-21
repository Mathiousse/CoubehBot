
import { client } from "../index.js"
import { userCoubehStats, messagesCoubeds } from "../database.js";

client.once('ready', async (readyClient) => {
    console.log("iiii")
    console.log(`Logged in as ${readyClient.user.tag}!`);
});