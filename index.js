// Carregar variáveis de ambiente
require('dotenv').config();

// Dependências
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// Inicializar o web server para manter o bot online no Railway
const app = express();
app.get('/', (req, res) => res.send('Bot está online!'));
app.listen(3000, () => console.log('Web server está rodando.'));

// Configurar o cliente Discord
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Variáveis de ambiente
const token = process.env.TOKEN; // Token do bot
const prefix = process.env.PREFIX || '!'; // Prefixo padrão
const blacklist = process.env.BLACKLIST ? process.env.BLACKLIST.split(',') : []; // Links bloqueados

// Evento: Quando o bot está pronto
client.once('ready', () => {
    console.log(`Bot ${client.user.tag} está online!`);
});

// Evento: Monitorar mensagens no servidor
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    for (let link of blacklist) {
        if (message.content.includes(link)) {
            message.delete().catch(console.error);
            return message.channel.send(`⚠️ ${message.author}, esse link não é permitido!`);
        }
    }

    if (message.content.startsWith(prefix)) {
        const [command, ...args] = message.content.slice(prefix.length).trim().split(/\s+/);

        if (command === 'addlink') {
            const link = args[0];
            if (!link) return message.reply('Você precisa informar um link.');
            blacklist.push(link);
            return message.reply(`✅ O link \`${link}\` foi adicionado à blacklist.`);
        }

        if (command === 'removelink') {
            const link = args[0];
            if (!link || !blacklist.includes(link)) return message.reply('Link não encontrado.');
            blacklist.splice(blacklist.indexOf(link), 1);
            return message.reply(`✅ O link \`${link}\` foi removido da blacklist.`);
        }

        if (command === 'blacklist') {
            return message.reply(blacklist.length ? `🛑 Links bloqueados: ${blacklist.join(', ')}` : 'Nenhum link bloqueado.');
        }
    }
});

client.login(token);
