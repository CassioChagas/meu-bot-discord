require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const express = require('express');

// Inicializar o web server
const app = express();
app.get('/', (req, res) => res.send('Bot está online!'));
app.listen(3000, () => console.log('Web server está rodando.'));

// Configuração do bot
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const token = process.env.TOKEN; // Token do bot
const prefix = process.env.PREFIX || '!'; // Prefixo
const blacklist = process.env.BLACKLIST ? process.env.BLACKLIST.split(',') : []; // Links bloqueados
const logChannelName = '🅱🅾🅾🆃🆂'; // Nome do canal onde os logs serão enviados

// Evento: Bot online
client.once('ready', () => {
    console.log(`Bot ${client.user.tag} está online!`);
});

// Evento: Mensagens
client.on('messageCreate', async (message) => {
    // Ignorar mensagens de outros bots
    if (message.author.bot) return;

    // Verificar links na blacklist
    for (let link of blacklist) {
        if (message.content.includes(link)) {
            // Apagar a mensagem
            await message.delete().catch(console.error);

            // Enviar log para o canal de logs
            const logChannel = message.guild.channels.cache.find(channel => channel.name === logChannelName);
            if (logChannel) {
                logChannel.send(`🔗 **Link bloqueado:**\nAutor: ${message.author.tag}\nConteúdo: ${message.content}`);
            }

            // Avisar o usuário
            return message.channel.send(`⚠️ ${message.author}, esse link não é permitido!`);
        }
    }

    // Comandos
    if (message.content.startsWith(prefix)) {
        const [command, ...args] = message.content.slice(prefix.length).trim().split(/\s+/);

        if (command === 'addlink') {
            // Restringir comando a administradores
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.reply('❌ Você não tem permissão para usar este comando.');
            }

            const link = args[0];
            if (!link) return message.reply('❌ Você precisa informar um link.');
            blacklist.push(link);

            return message.reply(`✅ O link \`${link}\` foi adicionado à blacklist.`);
        }

        if (command === 'removelink') {
            // Restringir comando a administradores
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.reply('❌ Você não tem permissão para usar este comando.');
            }

            const link = args[0];
            if (!link || !blacklist.includes(link)) {
                return message.reply('❌ Link não encontrado na blacklist.');
            }
            blacklist.splice(blacklist.indexOf(link), 1);

            return message.reply(`✅ O link \`${link}\` foi removido da blacklist.`);
        }

        if (command === 'blacklist') {
            return message.reply(blacklist.length ? `🛑 Links bloqueados: ${blacklist.join(', ')}` : '✅ Nenhum link bloqueado.');
        }
    }
});

// Login do bot
client.login(token);

