
const parseString = require('xml2js').parseString;
const fs = require('fs');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const subPath = "MICASE/";

const baseUrl = "sources/" + subPath;

const baseDownloadPath = "download/" + subPath;

const baseMarginal = "marginal/"
const specialCharts = [" ", ",", "\\."];

let _parseDir = (url) => {
  let dirs = fs.readdirSync(url);
  return dirs;
}

let _createDir = (url) => {
  // check whether the folder of download, and create the new folder 
  if (!fs.existsSync(url)) {
    fs.mkdirSync(url);
    console.log("Sucess to create new folder: " + url);
  }
}

let _parseTag = (body) => {
  if (body) {
    if (body.array) {
      let bodys = body.array;
      for (let k in bodys) {
        fs.appendFileSync(downloadPath, bodys[k].text() + "\n");
      }
    } else {
      fs.appendFileSync(downloadPath, body.text() + "\n");
    }
  }
}

let _parseMarginalWords = (url) => {
  let files = fs.readdirSync(url);
  let wds = [];
  for (let key in files) {
    let w = fs.readFileSync(url + files[key]).toString();
    let reg = new RegExp("\t", "g");
    wds = wds.concat(w.replace(reg, "").split("\n"));
  }
  return wds;
}

let read2 = (url, mds, downloadPath) => {
  let data = fs.readFileSync(url).toString();
  // remove the header of xml
  let start = data.indexOf("<TEXT>");
  let end = data.indexOf("</TEXT>");
  if (start == -1 && end == -1) {
    start = data.indexOf("<text>")
    end = data.indexOf("</text>");
  }
  let parseString = data;
  if (start != -1 && end != -1) {
    let len = end - start + 7;
    parseString = data.substr(start, len);
  }

  parseString = parseString.replace(new RegExp(">", "gi"), "> ");
  parseString = parseString.replace(new RegExp("</", "gi"), " </");
  parseString = parseString.replace(new RegExp("-", "gi"), " ");

  // remove the marginal words
  for (let key in mds) {
    let matchStr = mds[key];
    for (let k in specialCharts) {
      let cmatchStr = " " + matchStr + specialCharts[k];
      let reg = new RegExp(cmatchStr, "gi");
      parseString = parseString.replace(reg, " ");
      parseString = parseString.replace(reg, " ");
    }
  }
  fs.appendFileSync(downloadPath, parseString);
}

let _parseSubDir = (dirPath, mds) => {
  let downloadUrlPath;
  if (dirPath.indexOf(".") == -1) {
    downloadUrlPath = baseDownloadPath + dirPath + "/";
    _createDir(downloadUrlPath);
  }

  let readPath = baseUrl + dirPath + "/";
  console.log("Parse all files in the dir: " + readPath);
  // parse all files in current dir
  let files = _parseDir(readPath);
  for (let key in files) {
    console.log(readPath + files[key]);
    downloadPath = downloadUrlPath + files[key];
    console.log(downloadPath);
    read2(readPath + files[key], mds, downloadPath);
  }
}

let app = (baseUrl) => {
  let dirs = _parseDir(baseUrl);
  let mds = _parseMarginalWords(baseMarginal);
  if (dirs.length > 0) {
    return {dirs, mds};
  } else {
    console.log(baseUrl + "dir does not exist file or dir");
  }
}

if (cluster.isMaster) {
  let kVal = app(baseUrl);
  let endTaskNum = 0;
  for (let i = 0; i < kVal.dirs.length; ++i) {
    const worker = cluster.fork();
    let o = {i: kVal.dirs[i], j: kVal.mds};
    worker.send({dir: kVal.dirs[i], mds: kVal.mds});
  }

  cluster.on('message', (worker, message, handle) => {
    console.log(`[Master]# Worker ${worker.id}: ${message}`);
    endTaskNum++;
    if (endTaskNum === kVal.dirs.length) {
      console.timeEnd('main');
      cluster.disconnect();
    }
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  process.on('message', val => {
    console.log(`[Worker]# starts calculating...`);
    const start = Date.now();
    _parseSubDir(val.dir, val.mds);
    console.log(`[Worker]# The result of task ${process.pid} is ${val.dir}, taking ${Date.now() - start} ms.`);
    process.send('My task has ended.')
  });
}