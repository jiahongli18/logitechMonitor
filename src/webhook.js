const Discord = require("discord.js");

async function send(sku, name, message, image, url, webhookId, webhookToken) {
  let checkOutOne = `https://buy.logitech.com/store/logib2c/AddItemRefID/pageType.shoppingCart/externalRefID.${sku}/Locale.de-de/quantity.1&ccp=34-12935-12935-960-001194&cl=de,de`;
  let checkOutTwo = `https://buy.logitech.com/store/logib2c/AddItemRefID/pageType.shoppingCart/externalRefID.${sku}/Locale.de-de/quantity.2&ccp=34-12935-12935-960-001194&cl=de,de`;

  const discordEmbed = new Discord.MessageEmbed()
    .setAuthor("Logitech")
    .setTitle(name)
    .setDescription(`Stock: \n ${message}`)
    .setURL(url)
    .setThumbnail(image)
    .addField("Add One to Cart", `[Click here](${checkOutOne})`)
    .addField("Add Two to Cart", `[Click here](${checkOutTwo})`)
    .setColor("#ff0000")
    .setFooter(
      "SSilenced Logitech Monitor",
      "https://pbs.twimg.com/profile_images/1135979230175432704/jqfLM2Np_400x400.jpg"
    );

  const webhook = new Discord.WebhookClient(webhookId, webhookToken);
  webhook.send(discordEmbed);
}

module.exports = { send };
