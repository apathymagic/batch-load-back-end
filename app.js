const co = require('./co');
require('dotenv').config();

const base_url = process.env.BASE_URL;
const base_orin_url = process.env.BASE_ORIN_URL;

let index = 1;
let start = 25300;
const end = 90000;

let app = async (URL) => {
  try {  
    console.log(URL);
    // Request the page of download that you need to download
    const data = await co.getPage(URL);
    console.log('********');
    // console.log(data.res);
    // Check whether images in the current page 
    if (true) {
      let arr = co.getTitle(data.res);
      arr.forEach((element) => {
        // Download images
        co.download(element);
      });
      // // Download images
      // await co.download(data.res);
      // // Download images of the next page
      // ++index;
      // const new_url = `${base_url}${start}/${index}.html`;
      // app(new_url);
    } else {
      index = 1;
      console.log(`${base_url}${start} Current page has been download.`);
      ++start;
      if (start < end) {
        // request the next page
        app(base_url + start);
      } else {
        console.log(`${base_url}${end} All pages have been download.`);
      }
    }
  } catch (err) {
    console.log('Failed to get page, error :' + JSON.stringify(err));
  }
};

app(base_url);
let superagent = require('superagent');
let charset = require('superagent-charset');
charset(superagent);
let request= require("request");
let http = require('http');
const fs = require("fs");
const cheerio = require("cheerio");

let parseString = require('xml2js').parseString;

let saveImage = (url, path) => {
  http.get(url, function (req,res) {
      var imgData = '';
      req.on('data',function (chunk) {
          imgData += chunk;
      })
      req.setEncoding('binary');
      req.on('end', () => {
          fs.writeFileSync(path, imgData,'binary', (err) => {
              console.log('Save image: ' + path);
          })
      })
  })
}

let main = (url) => {
  request(url, async (error, res, body) => {
    parseString(res.body, function (err, result) {
      let array = JSON.parse(JSON.stringify(result)).ListBucketResult;
      console.log(array);
      // console.log(array[0].Key);
      let $ = cheerio.load(body);
      array.forEach((i, v) => {
        if (i.Key[0].split(".")[1]=='png') {
          // saveImage(base_orin_url + i.Key[0], "image/" + i.Key[0].split("/")[i.Key[0].split("/").length-1]);
        }
      });
    })
  });
};

// main(base_url);