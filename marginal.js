
const fs = require('fs');

const baseMarginalUrl = "ASWL_families_Level4";

let format = (url) => {
  let tt = fs.readFileSync(url).toString().toUpperCase();
  let lines = tt.split("\r");
  for (let key in lines) {
    let a = [];
    let line = lines[key].replace(new RegExp(" ", "gi"), "");
    let ws = line.split("\t");
    for (let k in ws) {
      if (ws[k].length > 0) {
        a.push(ws[k]);
      }
    }
    a = Array.from(new Set(a));

    // write marginal words
    for (let k in a) {
      let formatStr = a[k] + "\n";
      if (k != 0) formatStr = "\t" + formatStr;
      fs.appendFileSync(baseMarginalUrl + "_format.txt", formatStr);
    }
  }
}

format(baseMarginalUrl + ".txt");