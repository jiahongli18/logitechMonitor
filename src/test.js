const pup = require("puppeteer");

exports.getPage = url => {
  return new Promise(async resolve => {
    const browser = await pup.launch();
    const page = await browser.newPage();

    await page.setCacheEnabled(false);

    await page.goto(url);

    let data = await page.evaluate(() => document.body.innerHTML);

    await browser.close();

    let time = cheerio
      .load(data)("pre")
      .text()
      .split("CREATED:")[1]
      .split("CDT")[0];

    data = cheerio
      .load(data)("pre")
      .text()
      .trim()
      .replace(/<!--[\s\S]*?-->/g, "");

    data = JSON.parse(data.split("productDetailsmain(")[1].split(")")[0]);

    inStock = data.productInfo.product.purchasable;

    // console.log(time);
    // console.log(inStock ? "In Stock" : "OOS");

    // return inStock ? "In Stock" : "OOS";

    resolve(inStock);
  });
};
