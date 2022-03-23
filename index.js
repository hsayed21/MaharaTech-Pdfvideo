const {
  StartFrameExtract,
  StartRemoveDup,
  StartNewCourse,
} = require('./Maharatech.js');
var inquirer = require('inquirer');

(async () => {
  await inquirer
    .prompt([
      {
        type: 'list',
        name: 'op_type',
        message: 'Operation Type:',
        choices: [
          'New Course',
          'Continue Extracting Frames',
          'Remove Duplicated Image',
        ],
        default: 'New Course',
      },
    ])
    .then((answers) => {
      // Use user feedback for... whatever!!
      if (answers.op_type == 'New Course') {
        StartNewCourse(courseURL);
      } else if (answers.op_type == 'Continue Extracting Frames') {
        console.log(`[-] Extracing Video To Frames...`);
        StartFrameExtract(3);
        console.log(`[+] Done, Frames Extracted`);
        // console.log(`\n[+] Saved to "${courseName}" folder\n`);
      } else if (answers.op_type == 'Remove Duplicated Image') {
        console.log(`[-] Removing Duplicated Images...`);
        StartRemoveDup(czkawka_cli);
        console.log(`[+] Done Removed Duplicated Images`);
      }
    })
    .catch((error) => {
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else went wrong
      }
    });
})();
