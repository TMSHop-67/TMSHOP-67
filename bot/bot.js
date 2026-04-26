const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  SlashCommandBuilder
} = require('discord.js');

const fs = require('fs');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const OWNER_ID = '1077758253376733286';
const WALLET_FILE = './wallets.json';

function loadWallets() {
  if (!fs.existsSync(WALLET_FILE)) return {};
  return JSON.parse(fs.readFileSync(WALLET_FILE, 'utf8'));
}

function saveWallets(wallets) {
  fs.writeFileSync(WALLET_FILE, JSON.stringify(wallets, null, 2));
}

client.once('ready', async () => {
  console.log(`Bot prêt : ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder()
      .setName('stock')
      .setDescription('Afficher le stock'),

    new SlashCommandBuilder()
      .setName('walletadd')
      .setDescription('Ajouter de l’argent au wallet')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('Utilisateur')
          .setRequired(true)
      )
      .addNumberOption(option =>
        option.setName('montant')
          .setDescription('Montant à ajouter')
          .setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName('walletsupr')
      .setDescription('Retirer de l’argent du wallet')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('Utilisateur')
          .setRequired(true)
      )
      .addNumberOption(option =>
        option.setName('montant')
          .setDescription('Montant à retirer')
          .setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName('walletcheck')
      .setDescription('Voir le solde wallet')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('Utilisateur à vérifier')
          .setRequired(false)
      )
  ].map(command => command.toJSON());

  await client.application.commands.set(commands);
  console.log('Commandes enregistrées');
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'stock') {
      if (interaction.user.id !== OWNER_ID) {
        return interaction.reply({
          content: '❌ Tu n’as pas la permission.',
          ephemeral: true
        });
      }

      const message = `
🍔 **McDo'Shop - STOCK MCDO**

McDonalds 50-74 — €2.00 | ✅ En stock
McDonalds 75-99 — €3.50 | ✅ En stock
McDonalds 100-124 — €4.50 | ✅ En stock
McDonalds 125-149 — €5.50 | ✅ En stock
McDonalds 150-174 — €6.50 | ✅ En stock
McDonalds 175-199 — €7.00 | ✅ En stock
McDonalds 200-249 — €9.00 | ✅ En stock
McDonalds 250-299 — €10.00 | ✅ En stock

━━━━━━━━━━━━━━
💡 Clique sur un bouton pour commander
`;

      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('mcdo_50_74').setLabel('🍔 McDo 50-74').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('mcdo_75_99').setLabel('🍔 McDo 75-99').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('mcdo_100_124').setLabel('🍔 McDo 100-124').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('mcdo_125_149').setLabel('🍔 McDo 125-149').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('mcdo_150_174').setLabel('🍔 McDo 150-174').setStyle(ButtonStyle.Primary)
      );

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('mcdo_175_199').setLabel('🍔 McDo 175-199').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('mcdo_200_249').setLabel('🍔 McDo 200-249').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('mcdo_250_299').setLabel('🍔 McDo 250-299').setStyle(ButtonStyle.Primary)
      );

      return interaction.reply({
        content: message,
        components: [row1, row2]
      });
    }

    if (interaction.commandName === 'walletadd') {
      if (interaction.user.id !== OWNER_ID) {
        return interaction.reply({ content: '❌ Permission refusée', ephemeral: true });
      }

      const user = interaction.options.getUser('user');
      const amount = interaction.options.getNumber('montant');

      const wallets = loadWallets();
      wallets[user.id] = (wallets[user.id] || 0) + amount;
      saveWallets(wallets);

      return interaction.reply(`✅ ${amount.toFixed(2)}€ ajoutés au wallet de ${user}.\n💰 Nouveau solde : **${wallets[user.id].toFixed(2)}€**`);
    }

    if (interaction.commandName === 'walletsupr') {
      if (interaction.user.id !== OWNER_ID) {
        return interaction.reply({ content: '❌ Permission refusée', ephemeral: true });
      }

      const user = interaction.options.getUser('user');
      const amount = interaction.options.getNumber('montant');

      const wallets = loadWallets();
      wallets[user.id] = Math.max((wallets[user.id] || 0) - amount, 0);
      saveWallets(wallets);

      return interaction.reply(`✅ ${amount.toFixed(2)}€ retirés du wallet de ${user}.\n💰 Nouveau solde : **${wallets[user.id].toFixed(2)}€**`);
    }

    if (interaction.commandName === 'walletcheck') {
      const targetUser = interaction.options.getUser('user') || interaction.user;

      const wallets = loadWallets();
      const balance = wallets[targetUser.id] || 0;

      return interaction.reply(`💳 Wallet de ${targetUser} : **${balance.toFixed(2)}€**`);
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'close_ticket') {
      await interaction.reply({ content: '🔒 Fermeture...', ephemeral: true });

      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 2000);

      return;
    }

    const products = {
      mcdo_50_74: ['McDonalds 50-74', '€2.00'],
      mcdo_75_99: ['McDonalds 75-99', '€3.50'],
      mcdo_100_124: ['McDonalds 100-124', '€4.50'],
      mcdo_125_149: ['McDonalds 125-149', '€5.50'],
      mcdo_150_174: ['McDonalds 150-174', '€6.50'],
      mcdo_175_199: ['McDonalds 175-199', '€7.00'],
      mcdo_200_249: ['McDonalds 200-249', '€9.00'],
      mcdo_250_299: ['McDonalds 250-299', '€10.00']
    };

    const productData = products[interaction.customId];

    if (!productData) return;

    const [produit, prix] = productData;

    const existingChannel = interaction.guild.channels.cache.find(
      ch =>
        ch.name === `ticket-${interaction.user.username}`.toLowerCase() &&
        ch.type === ChannelType.GuildText
    );

    if (existingChannel) {
      return interaction.reply({
        content: `❌ Tu as déjà un ticket ouvert : ${existingChannel}`,
        ephemeral: true
      });
    }

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`.toLowerCase(),
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        }
      ]
    });

    const closeRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('🔒 Fermer le ticket')
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `🎫 **Ticket**\n👤 Client : ${interaction.user}\n📦 Produit : **${produit}**\n💸 Prix : **${prix}**\n\nMerci d’attendre le staff.`,
      components: [closeRow]
    });

    return interaction.reply({
      content: '✅ Ticket créé !',
      ephemeral: true
    });
  }
});

client.login(process.env.TOKEN);
