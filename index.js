const Discord = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const { token, autoDM, autoDeleteMessageAfterSend } = require('./settings.json');
const saveData = require('./save.json');

const client = new Discord.Client({
    checkUpdate: false
});

const lastMessages = new Map();
const repliedUsers = new Set();

client.on('ready', () => {
    console.log(`${client.user.username} is now online!`);
    
    const channelId = '1298667554172305540';
    const channel = client.channels.cache.get(channelId);
    if (channel) {
        channel.send('Hello World')
            .then(() => {
                console.log(`Message sent to channel with ID ${channelId}`);
                startAutoMessages();
            })
            .catch(() => {
                console.error(`????????????????????????????????????????????`);
                console.log('YT: https://www.youtube.com/@Mr-Moundo');
                console.log('Discord: https://discord.gg/Mq4Ca7TXc7');
                process.exit(1);
            });
    } else {
        console.error(`Channel with ID ${channelId} not found.`);
        console.log('YT: https://www.youtube.com/@Mr-Moundo');
        console.log('Discord: https://discord.gg/Mq4Ca7TXc7');
        process.exit(1);  
    }
});

async function startAutoMessages() {
    const schedule = saveData.schedule;
    const groupedMessages = groupMessagesByNumber(schedule);

    while (true) {
        console.log("Starting message cycle...");
        for (const numberGroup of groupedMessages) {
            await sendGroupMessagesSimultaneously(numberGroup);
        }
        console.log("Message cycle completed. Restarting...");
    }
}

function groupMessagesByNumber(schedule) {
    const grouped = {};
    for (const entry of schedule) {
        const { number } = entry;
        if (!grouped[number]) grouped[number] = [];
        grouped[number].push(entry);
    }

    return Object.keys(grouped)
        .sort((a, b) => a - b)
        .map((key) => grouped[key]);
}

async function sendGroupMessagesSimultaneously(group) {
    const promises = [];

    for (const entry of group) {
        const { serverId, channelId, message } = entry;

        const server = client.guilds.cache.get(serverId);
        if (!server) {
            console.error(`Server with ID ${serverId} not found.`);
            continue;
        }

        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            console.error(`Channel with ID ${channelId} not found.`);
            continue;
        }

        const promise = new Promise(async (resolve) => {
            try {
                if (autoDeleteMessageAfterSend && lastMessages.has(channelId)) {
                    const previousMessage = lastMessages.get(channelId);
                    try {
                        await previousMessage.delete();
                    } catch (err) {
                        console.error(`Failed to delete previous message in channel ${channelId}:`, err.message);
                    }
                }

                const sentMessage = await channel.send(message);
                lastMessages.set(channelId, sentMessage);
                resolve();
            } catch (err) {
                console.error(`Failed to send message in channel ${channelId}:`, err.message);
                resolve();
            }
        });

        promises.push(promise);
    }

    await Promise.all(promises);

    const groupTime = parseTime(group[0].time);
    await sleep(groupTime);
}

function parseTime(timeString) {
    const units = timeString.split('&');
    let totalMilliseconds = 0;

    units.forEach((unit) => {
        if (unit.endsWith('s')) totalMilliseconds += parseInt(unit) * 1000;
        else if (unit.endsWith('m')) totalMilliseconds += parseInt(unit) * 60000;
        else if (unit.endsWith('h')) totalMilliseconds += parseInt(unit) * 3600000;
    });

    return totalMilliseconds;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

if (autoDM) {
    client.on('messageCreate', async (message) => {
        if (
            message.author.id === client.user.id ||
            repliedUsers.has(message.author.id) ||
            message.channel.type !== 'DM'
        ) return;

        try {
            await message.reply(autoDM);
            await message.reply("CodeBy: moundo1");
            repliedUsers.add(message.author.id);
        } catch (err) {
            console.error(`Failed to send auto DM reply:`, err.message);
        }
    });
}

client.login(token);

// يااااااااااااا
// بلاش تعديل
// بلاش تشغيل دماغ
// فضي دمغاك
// تقدر تخلي الوقت زي ما تبي
// s/m/h/
// مكسل اكمل شرح فا شوف الفديو يوتيوب او افتح تكت 