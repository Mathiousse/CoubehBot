import Sequelize from 'sequelize';
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

export const userCoubehStats = sequelize.define('userCoubehStats', {
    discordid: {
        type: Sequelize.STRING,
    },
    guildId: {
        type: Sequelize.STRING,
    },
    username: {
        type: Sequelize.STRING,
    },
    quoicoubehCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
});

export const messagesCoubeds = sequelize.define('messagesCoubeds', {
    messageId: {
        type: Sequelize.STRING,
        unique: true,
    },
    guildId: {
        type: Sequelize.STRING,
    },
    coubedBy: {
        type: Sequelize.STRING,
    }
});


export const leaderboardMessages = sequelize.define('leaderboardMessages', {
    guildId: {
        type: Sequelize.STRING,
        unique: true,
    },
    messageId: {
        type: Sequelize.STRING,
    },
    channelId: {
        type: Sequelize.STRING,
    }
});
