const axios = require("axios");
const webhook = require("./webhook");
const httpsProxyAgent = require("https-proxy-agent");
const settings = require("./settings.json");

async function checkStock(sku) {
  let proxyList = settings.proxyList;
  let proxy = Math.floor(Math.random() * proxyList.length);
  let currentProxy = proxyList[1];
  const agent = new httpsProxyAgent(currentProxy);
  let url = `https://buy.logitech.com/store/logib2c/DisplayDRProductInfo/version.2/externalReferenceID.${sku}/content.stockStatus/output.json/jsonp.productDetailsmain?`;
  let inStock = false;

  try {
    const { data } = await axios(url, {
      method: "GET",
      httpsAgent: agent,
      headers: {
        "User-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36"
      }
    });

    inStock = data.includes("Out Of Stock") ? "In stock" : "OOS";
  } catch (e) {
    console.log((`Error requesting ${sku} endpoint`, e));
  }

  return inStock;
}

async function findChange(sku, name, image, url, id, token) {
  let lastState = false;

  setInterval(async function() {
    latestState = await checkStock(sku);
    if (latestState && latestState != lastState) {
      if (!lastState) {
        console.log("Finding item");
      } else {
        console.log("Change detected");
        send(name, latestState, image, url, id, token);
      }
    } else if (lastState == latestState) {
      console.log(
        `The quantity of the webpage is still the same. No change has been detected.`
      );
    } else {
      return console.log("Possible server error");
    }

    lastState = latestState;
  }, settings.refreshInterval);
}

for (let i = 0; i < settings.items.length; i++) {
  findChange(
    settings.items[i].sku,
    settings.items[i].name,
    settings.items[i].image,
    settings.items[i].url,
    settings.webhooks[0].id,
    settings.webhooks[0].token
  );
}
