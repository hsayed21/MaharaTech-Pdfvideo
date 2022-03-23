const fs = require('fs');
// const blockhash = require('blockhash-core');
// const { imageFromBuffer, getImageData } = require('@canvas/image');
const { execSync } = require('child_process');

const refMap = new Map();

async function getFileNames(imgFolder) {
  return new Promise((resolve, reject) => {
    fs.readdir(imgFolder, (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });
}

async function generateRefMap(imgFolder) {
  const files = await getFileNames(imgFolder);
  for (let i = 0; i < files.length; i++) {
    const imgHash = await hash(`${imgFolder}${files[i]}`);
    let valueArray;
    if (refMap.has(imgHash)) {
      const existingPaths = refMap.get(imgHash);
      valueArray = [...existingPaths, `${imgFolder}${files[i]}`];
    } else {
      valueArray = [`${imgFolder}${files[i]}`];
    }
    refMap.set(imgHash, valueArray);
  }
  return refMap;
}

async function initInMemoryHashMap(imgFolder) {
  return await generateRefMap(imgFolder);
}

async function hash(imgPath) {
  try {
    const data = await readFile(imgPath);
    const hash = await blockhash.bmvbhash(getImageData(data), 8);
    return hexToBin(hash);
  } catch (error) {
    console.log(error);
  }
}

function hexToBin(hexString) {
  const hexBinLookup = {
    0: '0000',
    1: '0001',
    2: '0010',
    3: '0011',
    4: '0100',
    5: '0101',
    6: '0110',
    7: '0111',
    8: '1000',
    9: '1001',
    a: '1010',
    b: '1011',
    c: '1100',
    d: '1101',
    e: '1110',
    f: '1111',
    A: '1010',
    B: '1011',
    C: '1100',
    D: '1101',
    E: '1110',
    F: '1111',
  };
  let result = '';
  for (i = 0; i < hexString.length; i++) {
    result += hexBinLookup[hexString[i]];
  }
  return result;
}

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err);
      resolve(imageFromBuffer(data));
    });
  });
}

function calculateSimilarity(hash1, hash2) {
  // Hamming Distance
  let similarity = 0;
  hash1Array = hash1.split('');
  hash1Array.forEach((bit, index) => {
    hash2[index] === bit ? similarity++ : null;
  });
  return parseInt((similarity / hash1.length) * 100);
}

async function compareImages(imgPath1, imgPath2) {
  const hash1 = await hash(imgPath1);
  const hash2 = await hash(imgPath2);
  return calculateSimilarity(hash1, hash2);
}

async function getDuplicateImages(imgFolder) {
  const files = await getFileNames(imgFolder);
  for (const file of files) {
    const imgPath = `${imgFolder}${file}`;
    const imgHash = await hash(imgPath);
    if (refMap.has(imgHash)) {
      console.log(
        'the provided image already exists in the img directory with the following path(s):\n'
      );
      const dupes = refMap.get(imgHash);
      dupes.forEach((path) => console.log(`${path}\n`));
    } else {
      console.log('no duplicates found');
    }
  }
}

async function removeDuplicateImages(map) {
  for (const e of map) {
    const files = Array.from(e[1]).sort();
    if (files.length > 1) {
      for (let i = 0; i < files.length; i++) {
        if (i < files.length - 1) {
          fs.unlinkSync(files[i], (err) => {
            if (err) {
              console.error(err);
              // return;
            }
            //file removed
          });
        }
      }
    }
  }
  console.log('Deleted Done');
}

function readTxtFile(path) {
  return fs.readFileSync(path, 'utf-8');
}

const groupBy = (keys) => (array) =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = keys.map((key) => obj[key]).join('-');
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

function displayData(filterdData) {
  var i = 1;
  filterdData.forEach((e) => {
    console.log('========', ' Group: ', i, ' ==========');
    i++;
    for ([key, value] of Object.entries(e)) {
      // arr of each key
      console.log(key, ':');
      const arr = Array.from(value);
      for (let i = 0; i < arr.length; i++) {
        console.log(arr[i]['path']);
      }
    }
    console.log('\n');
  });
}

async function removeDuplicated(filterdData, filePath) {
  filterdData.forEach((e) => {
    for ([key, value] of Object.entries(e)) {
      // arr of each key
      console.log(key, ': Deleting....');
      const arr = Array.from(value);
      for (let i = 0; i < arr.length; i++) {
        if (i == arr.length - 1) {
          break;
        }

        fs.unlink(arr[i]['path'], function (err) {
          // if (err) throw err;
          if (err) {
            console.log(err);
          } else {
            // if no error, file has been deleted successfully
            const tmp = arr[i]['path'].split(['\\']);
            const title = tmp[tmp.length - 1];
            console.log(title, ' | File deleted!');
          }
        });
      }
    }
  });

  fs.unlinkSync(filePath, function (err) {
    if (err) {
      console.error(err);
    }
  });
}

function FilterAndGroupData(pathFileResult) {
  var result = readTxtFile(pathFileResult);
  var regx = /^\w:\\\b.*(?:\r?\n(?!Found|.*\bFound\b).*)*$/gm;
  result = Array.from(result.matchAll(regx));
  var arr_result = [];
  var arr_filterd = [];
  // Clean Data
  result.forEach((group) => {
    // foreach group (Similar)
    var split_files_arr = Array.from(String(group).split('\n')).sort(); //sorted alpha
    var tmp_group_arr = [];
    split_files_arr.forEach((_info) => {
      // each file in similar group
      var tmp_dict = {};
      const info = _info.split(' - ');
      if (info != '') {
        const file_path = info[0];
        const file_size = info[2].split(' ')[0];
        const arr = file_path.split(['\\']);
        const title = arr[arr.length - 1].split('-')[0];
        tmp_dict['title'] = title;
        tmp_dict['path'] = file_path;
        tmp_dict['size'] = file_size;
        tmp_group_arr.push(tmp_dict);
      }
    });

    // Sorted By Size (Largest)
    const sorted_arr = tmp_group_arr.sort(function (a, b) {
      return a.size - b.size;
    });
    arr_result.push(sorted_arr);
  });

  // Grouping By Title
  for (let index = 0; index < arr_result.length; index++) {
    const res = arr_result[index];
    const groupByTitle = groupBy(['title']);
    arr_filterd.push(groupByTitle(res));
  }

  return arr_filterd;
}
const iteration_alg = async (czkawka_Path, folderPath) => {
  return new Promise((resolve, reject) => {
    try {
      const img_filter = [
        'Lanczos3',
        'Nearest',
        'Triangle',
        'Faussian',
        'Catmullrom',
      ];
      const hash_alg = [
        'Mean',
        'Gradient',
        'Blockhash',
        'VertGradient',
        'DoubleGradient',
      ];

      var dir = './tmp/';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      } else {
        fs.rmSync(dir, { recursive: true, force: true });
        fs.mkdirSync(dir);
      }

      for (const f of img_filter) {
        for (const h of hash_alg) {
          var fileOutPath = `${dir}result_${f}_${h}.txt`;
          console.log('Starting ', f, '_', h);
          /* spawn parameters
        const child = spawn(czkawka_Path, [
          'image',
          '-d',
          folderPath,
          '-s',
          'VeryHigh',
          '-z',
          f,
          '-g',
          h,
          '-f',
          fileOutPath,
        ]);


        child.stdout.on('data', (data) => {
          console.log(data);
        });

        child.stderr.on('data', (data) => {
          console.log(data);
        });
        child.on('exit', (proc) => {
          console.log('Finished Process ', f, '_', h);
          const result = FilterAndGroupData(fileOutPath);
          console.log('=============', fileOutPath, '==============');
          console.log(result);
          removeDuplicated(result, fileOutPath);
        });
        child.on('error', (error) => {
          console.log(error);
          reject(false);
        });
        */
          execSync(
            `${czkawka_Path} image -d ${folderPath} -s VeryHigh -z ${f} -g ${h} -f ${fileOutPath}`,
            {
              maxBuffer: 1024 ** 6,
            }
          );
          const result = FilterAndGroupData(fileOutPath);
          removeDuplicated(result, fileOutPath);
        }
      }
    } catch (error) {
      console.log('error: ', error.message);
      reject(false);
    }
  });
};
async function getDuplicated(czkawka_Path, folderPath) {
  await Promise.all([iteration_alg(czkawka_Path, folderPath)]);
}

// async function getSimilarity(path1, path2) {
//   console.log(chalk.green.bold(`Comparing Images. Please Wait...`));
//   const similarityPercent = await compareImages(path1, path2);
//   const similarity = chalk.redBright.yellow.bold(`${similarityPercent}%`);
//   const result = chalk.red.bold(`The images are ${similarity} similar`);
//   const message = boxen(result, boxenOptions);
//   console.log(message);
// }

module.exports = {
  compareImages,
  getFileNames,
  removeDuplicateImages,
  initInMemoryHashMap,
  getDuplicateImages,
  displayData,
  removeDuplicated,
  getDuplicated,
};
