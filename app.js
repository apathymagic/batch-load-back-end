const co = require('./co');
require('dotenv').config();

const base_url = process.env.BASE_URL;

let index = 1;
let start = 25300;
const end = 90000;

let app = async (URL) => {
  // Request the page of download that you need to download
  const data = await co.getPage(URL);

  // Check whether images in the current page 
  if (co.getTitle(data.res)) {
    // Download images
    await co.download(data.res);
    // Download images of the next page
    ++index;
    const new_url = `${base_url}${start}/${index}.html`;
    app(new_url);
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
};

app(base_url + start);