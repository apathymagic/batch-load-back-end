let request = require('request-promise');
const cheerio = require("cheerio");
const fs = require("fs");

const basePath = "/Users/apathy/Desktop/download/";
let downloadPath;
let pageIndex = 1;

let getPage = async (url) => {
  const data = {
    url,
    res: await request({
      url: url
    })
  }
  return data;
};

let download = async (data) => {
  if (data) {
    let $ = cheerio.load(data);
    $("#hgallery").children().each(async (i, element) => {
      const imgSrc = $(elem).attr('src');
      const imgPath = "/" + imgSrc.split("/").pop().split(".")[0] + "." + imgSrc.split(".").pop();
      console.log(`${downloadPath + imgPath} Downloading...`);
      const imgData = await request({
        uri: imgSrc,
        resolveWithFullResponse: true,
        headers,
      }).pipe(fs.createWriteStream(downloadPath + imgPath));
    });

    console.log("Page done")
  }
};

let getTitle = (data) => {
  const $ = cheerio.load(data);
  if ($('#htitle').text()) {
    downloadPath = basePath + $("#htilte").text();
    // check whether the folder of download, and create the new folder 
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath);
      console.log("Sucess to create new folder.");
    }
    return true;
  } else {
    return false;
  }
};

module.exports = {
  getPage, getTitle, download
}