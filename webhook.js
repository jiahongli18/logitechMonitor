const Discord = require("discord.js");

async function send(name, message, image, url, webhookId, webhookToken) {
  const discordEmbed = new Discord.MessageEmbed()
    .setAuthor("Logitech")
    .setTitle(name)
    .setDescription(`Stock: \n ${message}`)
    .setURL(url)
    .setThumbnail(image)
    .setColor("#ff0000")
    .setFooter(
      "SSilenced Logitech Monitor",
      "https://pbs.twimg.com/profile_images/1135979230175432704/jqfLM2Np_400x400.jpg"
    );

  const webhook = new Discord.WebhookClient(webhookId, webhookToken);
  webhook.send(discordEmbed);
}

module.exports = { send };
