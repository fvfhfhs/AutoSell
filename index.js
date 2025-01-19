const Discord = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const { token, autoDM, autoDeleteMessageAfterSend } = require('./settings.json');
const saveData = require('./save.json');

const logFilePath = './log.json'; 

const client = new Discord.Client({
    checkUpdate: false
});

const repliedUsers = new Set();


let logData = loadLogData();

client.on('ready', async () => {
    console.log(`[INFO] ${client.user.username} is now online!`);
    startAutoMessages();
});

async function startAutoMessages() {
    const schedule = saveData.schedule;
    const groupedMessages = groupMessagesByNumber(schedule);

    while (true) {
        console.log("[INFO] Starting a new message cycle...");
        for (const numberGroup of groupedMessages) {
            await sendGroupMessagesSimultaneously(numberGroup);
        }
        console.log("[INFO] Message cycle completed. Restarting...");
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
    for (const entry of group) {
        const { serverId, channelId, message, time } = entry;


        const lastMessageTime = logData[channelId]?.lastSentAt || 0;
        const currentTime = Date.now();
        const requiredDelay = parseTime(time);

        const elapsedTime = currentTime - lastMessageTime;


        if (elapsedTime >= requiredDelay) {
            console.log(`[INFO] Sending message to channel ${channelId}...`);
            await sendMessageToChannel(serverId, channelId, message);
        } else {

            const timeRemaining = requiredDelay - elapsedTime;
            console.log(`[INFO] Waiting ${timeRemaining / 1000}s before sending message to channel ${channelId}...`);
            await sleep(timeRemaining);
            await sendMessageToChannel(serverId, channelId, message);
        }
    }
}

async function sendMessageToChannel(serverId, channelId, message) {
    const server = client.guilds.cache.get(serverId);
    if (!server) {
        console.error(`[ERROR] Server with ID ${serverId} not found.`);
        return;
    }

    const channel = client.channels.cache.get(channelId);
    if (!channel) {
        console.error(`[ERROR] Channel with ID ${channelId} not found.`);
        return;
    }

    try {

        if (autoDeleteMessageAfterSend && logData[channelId]?.lastMessageId) {
            const previousMessageId = logData[channelId].lastMessageId;
            try {
                const previousMessage = await channel.messages.fetch(previousMessageId);
                if (previousMessage) {
                    await previousMessage.delete();
                }
            } catch (err) {
            }
        }

        const sentMessage = await channel.send(message);

        logData[channelId] = {
            lastSentAt: Date.now(),
            lastMessageId: sentMessage.id
        };
        saveLogData(logData);
    } catch (err) {
        console.error(`[ERROR] Failed to send message in channel ${channelId}: ${err.message}`);
    }
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


function loadLogData() {
    if (fs.existsSync(logFilePath)) {
        try {
            const rawData = fs.readFileSync(logFilePath, 'utf-8');
            return JSON.parse(rawData);
        } catch (err) {
            console.error('[ERROR] Failed to load log data:', err.message);
            return {};
        }
    } else {
        return {};
    }
}


function saveLogData(data) {
    try {
        fs.writeFileSync(logFilePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('[ERROR] Failed to save log data:', err.message);
    }
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
            repliedUsers.add(message.author.id);
        } catch (err) {
            console.error(`[ERROR] Failed to send auto DM reply: ${err.message}`);
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
