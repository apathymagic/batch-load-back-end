let request = require('request-promise');
const cheerio = require("cheerio");
const fs = require("fs");

const basePath = "/Users/apathy/Desktop/download/";
const baseUrl =  "https://quod.lib.umich.edu/cgi/c/corpus/corpus?c=micase;cc=micase;action=downloadtranscript;id=";
let downloadPath;
let pageIndex = 1;

let getPage = async (url) => {
  // try {
    const data = {
      url,
      res: await request({
        url: url,
        method: 'GET',
        json: true,
        headers: {
          'content-type': 'application/json',
        }
      })
    }
    return data;
// } catch (err) {

// }
};

let download = async (data) => {
  if (data) {
    // let $ = cheerio.load(data);
    // $("#hgallery").children().each(async (i, element) => {
    //   const imgSrc = $(elem).attr('src');
    //   const imgPath = "/" + imgSrc.split("/").pop().split(".")[0] + "." + imgSrc.split(".").pop();
    //   console.log(`${downloadPath + imgPath} Downloading...`);
    //   const imgData = await request({
    //     uri: imgSrc,
    //     resolveWithFullResponse: true,
    //     headers,
    //   }).pipe(fs.createWriteStream(downloadPath + imgPath));

    // });
    console.log(data.substr(-11));
    let url = baseUrl + data.substr(-11);
    request(url).pipe(fs.createWriteStream(basePath + data.substr(-11) + ".xml"));
    console.log("Page done")
  }
};

let getTitle = (data) => {
  const $ = cheerio.load(data);
  let a = [];
  if ($('a').text()) {
    console.log($('a').attr("href"));
    $('a').each(function() {
      let t = $(this).attr("href");
      a.push(t);
    });
    downloadPath = basePath;
    // check whether the folder of download, and create the new folder 
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath);
      console.log("Sucess to create new folder.");
    }
    return a;
  } else {
    return a;
  }
};

module.exports = {
  getPage, getTitle, download
}