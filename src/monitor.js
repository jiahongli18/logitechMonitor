const axios = require("axios");
const webhook = require("./webhook");
const httpsProxyAgent = require("https-proxy-agent");
const settings = require("./settings.json");
const request = require("request-promise");

async function checkStock(sku) {
  let proxyList = formatProxies(settings.proxyList);
  let proxy = Math.floor(Math.random() * proxyList.length);
  let currentProxy = proxyList[0];
  const agent = new httpsProxyAgent(currentProxy);
  // let url = `https://buy.logitech.com/store/logib2c/DisplayDRProductInfo/version.2/externalReferenceID.${sku}/content.stockStatus/output.json/jsonp.productDetailsmain?`;
  let url = `https://buy.logitech.com/store/logib2c/DisplayDRProductInfo/version.2/externalReferenceID.960-001063/content.stockStatus/output.json/jsonp.productDetailsmain%60`;
  let inStock = false;

  try {
    const { data } = await axios(url, {
      method: "GET",
      httpsAgent: agent,
      headers: {
        "User-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36"
      }
    });

    inStock = data.includes("Out Of Stock") ? "OOS" : "In stock";
  } catch (e) {
    if (
      e.response &&
      (e.response.status === 430 || e.response.status === 429)
    ) {
      console.log(`Proxy banned`);
      checkStock(sku);
    } else if (e.response && e.response.status === 403) {
      console.log(`This site has a high level of protection from monitors.`);
      checkStock(sku);
    } else if (e.response && e.response.status === 502) {
      console.log(`Bad gateway error. Check proxies.`);
      checkStock(sku);
    } else if (e.response && e.response.status === 503) {
      console.log(
        `The server cannot handle the request (because it is overloaded or down for maintenance)`
      );
      checkStock(sku);
    } else if (e.code === "ETIMEDOUT") {
      console.log(`Timeout occurred`);
      checkStock(sku);
      console.log(`Trying again with a different proxy`);
    } else if (e.code === "ECONNRESET") {
      console.log(`The connection was reset`);
      checkStock(sku);
    } else {
      console.log(e);
      checkStock(sku);
    }
  }

  return inStock;
}

async function findChange(sku, name, image, url, id, token) {
  let lastState = false;
  setInterval(async function() {
    latestState = await checkStock(sku);
    if (latestState && latestState != lastState) {
      if (!lastState) {
        console.log(`Finding ${name}. Currently ${latestState}.`);
      } else {
        console.log(`Change detected. ${name} is now ${latestState}.`);
        webhook.send(sku, name, latestState, image, url, id, token);
      }
    } else if (lastState == latestState) {
      //console.log(`No change detected.`);
    } else {
      return console.log("Possible server error");
    }

    lastState = latestState;
  }, settings.refreshInterval);
}

function formatProxies(proxies) {
  let formattedProxies = [];
  for (i in proxies) {
    let proxy = proxies[i].split(":");
    proxy = `http://${proxy[2]}:${proxy[3]}@${proxy[0]}:${proxy[1]}`;
    formattedProxies.push(proxy);
  }

  return formattedProxies;
}

let runTasks = () => {
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
};

runTasks();
