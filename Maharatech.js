// Libraries
/*
  1) puppeteer : npm install puppeteer
  2) ytdl-core : npm install ytdl-core
  3) fluent-ffmpeg : npm install fluent-ffmpeg
  4) @ffmpeg-installer/ffmpeg : npm install @ffmpeg-installer/ffmpeg
*/

'use strict';
require('dotenv').config();
const puppeteer = require('puppeteer');
const ytdl = require('ytdl-core');
var ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { spawn } = require('child_process');
const fs = require('fs');
const ProgressBar = require('./ProgressBar');
var inquirer = require('inquirer');
const { getDuplicated } = require('./util');
ffmpeg.setFfmpegPath(ffmpegPath);
const Bar = new ProgressBar();

const userAuthData = {
  username: process.env._user,
  password: process.env._pass,
};

const browserInstance = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 100000,
  });

  const page = await browser.newPage();
  // page.setViewport({
  //   height: 720,
  //   width: 1280,
  //   deviceScaleFactor: 2,
  // });
  await goPage(page, 'https://maharatech.gov.eg/login');
  page.setDefaultNavigationTimeout(0);
  return { browser, page };
};

const goPage = async (page, url) => {
  try {
    await page.goto(url, {
      timeout: 20000,
      waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'],
    });
  } catch (error) {
    console.log('error: ' + error + ' try again...');
    goPage(page, url);
  }
};

const login = async (page, courseUrl) => {
  await page.type('#username', userAuthData.username);
  await page.type('#password', userAuthData.password);
  await page.click('#loginbtn');
  await page.waitForNavigation({ waitUntil: 'load' });
  // await page.waitForNavigation({ waitUntil: 'networkidle2' });
  // await page.waitForResponse(response => response.ok())
  await goPage(page, courseUrl);
};

const checkExistElements = async (page, courseUrl) => {
  // Try until get elements
  try {
    await page.waitForSelector('.user_board');
  } catch (error) {
    console.log('error element not found', error);
    await goPage(page, courseUrl);
    checkExistElements(page, courseUrl);
  }
};

const getYTLinks = async (page, origLinks, def_yt_links = [], c = 0) => {
  let yt_links = Array.from(def_yt_links);
  // for (const orig of origLinks) {
  for (let i = c; i < origLinks.length; i++) {
    await goPage(page, origLinks[i]);
    try {
      await page.waitForSelector('iframe');
    } catch (error) {
      console.log('error: ' + error + ' try again...');
      getYTLinks(page, origLinks, yt_links, i);
    }
    const result = await page.evaluate(() => {
      const src = document
        .querySelector('iframe')
        .contentDocument.body.querySelector('iframe').src;
      const link = src.split('?')[0];
      return link;
    });

    yt_links.push(result);
  }
  return yt_links;
};

const getOrigLinks = async (page) => {
  return await page.evaluate(() => {
    let orig_links = [];
    Array.from(
      document.querySelectorAll(
        ".user_board .details .panel-body > ul li[class*='hvp'] .aalink"
      )
    ).forEach((e) => {
      orig_links.push(e.href);
    });
    return orig_links;
  });
};

const courseName = async (page) => {
  return await page.evaluate(() => {
    return document.querySelector('nav .title').textContent;
  });
};

async function yt_info(url) {
  const info = await ytdl.getInfo(url);
  const format = ytdl.chooseFormat(info.formats, {
    quality: 'highest',
    filter: 'video',
  });
  return { url: format.url, title: info.videoDetails.title };
}

async function ToFrames(inputUrl, outputFile, framePerSec) {
  Bar.init(100);
  return new Promise((resolve, reject) => {
    try {
      ffmpeg()
        .input(inputUrl)
        .outputOptions([`-vf fps=1/${framePerSec}`, '-n']) // one image every n second
        .output(`${outputFile}-%04d.jpg`)
        .on('error', function (err) {
          console.log('An error occurred: ' + err.message);
          reject(false);
        })
        .on('end', function () {
          resolve(true);
        })
        .on('progress', function (progress) {
          // console.log('Processing: ' + Math.floor(progress.percent) + '% done');
          Bar.update(Math.floor(progress.percent));
        })
        .run();
    } catch (error) {
      console.log('error: ', error.message);
      reject(false);
    }
  });
}

async function getCurrentDirs(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, { withFileTypes: true }, (error, files) => {
      if (error) throw error;
      const directoriesInDIrectory = files
        .filter((item) => item.isDirectory())
        .map((item) => item.name);
      resolve(directoriesInDIrectory);
    });
  });
}

async function askDirPath(currentPath) {
  const dirs = await Promise.all([getCurrentDirs(currentPath)]);
  return await inquirer.prompt([
    {
      type: 'list',
      name: 'dir_path',
      message: 'Select folder that contains YTLinks_tmp.txt :',
      choices: dirs[0],
    },
  ]);
}

async function StartFrameExtract(framePerSec) {
  const courseDir = await askDirPath('./');
  const tmp_file = `${courseDir}/YTLinks_tmp.txt`;
  if (fs.existsSync(tmp_file)) {
    const allFileContents = fs.readFileSync(tmp_file, 'utf-8');
    const links = Array.from(JSON.parse(allFileContents));
    if (links.length == 0) {
      fs.unlinkSync(tmp_file, function (err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
      });
      return;
    }

    // Continue for Extract Frames
    for (const link of links) {
      console.log('arr_links_len: ', links.length);
      console.log(link);
      const info = await yt_info(link);
      const title = info.title
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/__/g, '_');
      console.log('Title: ', title);
      const [flag] = await Promise.all([
        ToFrames(info.url, `${courseDir}/${title}`, framePerSec), // one frame every 3 second
      ]);

      console.log('Flag: ', flag);
      if (flag) {
        console.log('Link: ', link, ' Finished, Deleting...');
        const index = links.indexOf(link);
        links.splice(index, 1);
        fs.writeFileSync(tmp_file, JSON.stringify(links), function (err, data) {
          if (err) {
            console.error(err);
          }
          // console.log(data);
        });
      }
    }
  }
}

async function StartRemoveDup(czkawka_cli) {
  const courseDir = await askDirPath('./');
  await getDuplicated(czkawka_cli, `./${courseDir}`);
}

async function StartNewCourse(courseURL) {
  console.log('[-] Starting Browser...');
  const { browser, page } = await browserInstance();
  console.log(`[+] Browser Started`);
  console.log(`[-] Authenticating...`);
  await login(page, courseURL);
  console.log(`[+] Authenticated`);
  console.log(`[-] Check element existing...`);
  checkExistElements(page, courseURL);
  console.log(`[+] Elements Existed`);

  // Create folder
  var dir = `./${String(await courseName(page))
    .trim()
    .replace(/\s/g, '_')}/`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  console.log(`[-] Fetching Original Links...`);
  const OrigLinks = await getOrigLinks(page);
  console.log(`[+] Orig Links Fetched`);
  console.log(`[-] Fetching Youtube Links...`);
  const YTLinks = await getYTLinks(page, OrigLinks);
  console.log(`[+] YT Links Fetched`);
  console.log(YTLinks);

  // Save YTlinks to file
  fs.writeFileSync(
    `./${dir}YTLinks.txt`,
    JSON.stringify(YTLinks),
    function (err, data) {
      if (err) {
        console.error(err);
      }
    }
  );

  fs.writeFileSync(
    `./${dir}YTLinks_tmp.txt`,
    JSON.stringify(YTLinks),
    function (err, data) {
      if (err) {
        console.error(err);
      }
    }
  );

  console.log(`YT_Lins saved to ./${dir}YTLinks_tmp.txt`);

  browser.close();
  process.exit();
}

module.exports = {
  StartFrameExtract,
  StartRemoveDup,
  StartNewCourse,
};
