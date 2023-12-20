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
    coubedBy: {
        type: Sequelize.STRING,
    }
});
