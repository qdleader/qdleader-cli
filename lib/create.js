const path = require("path");
const fs = require("fs-extra");
const Inquirer = require("inquirer");

const Creator =  require("./Creator");
  // create.js


module.exports =  function (projectName, options) {

  console.log(projectName, options);
    // 获取当前工作目录
    const cwd = process.cwd();
    // 拼接得到项目目录
    const targetDirectory = path.join(cwd, projectName);

  const creator = new Creator(projectName, targetDirectory);
  
  creator.create();


  // 判断目录是否存在
  if (fs.existsSync(targetDirectory)) {
    // 判断是否使用 --force 参数
    if (options.force) {
      // 删除重名目录(remove是个异步方法)
       fs.remove(targetDirectory);
    } else {
      new Inquirer.prompt([
        // 返回值为promise
        {
          name: "isOverwrite", // 与返回值对应
          type: "list", // list 类型
          message: "Target directory exists, Please choose an action",
          choices: [
            { name: "Overwrite", value: true },
            { name: "Cancel", value: false },
          ],
        },
      ])
        .then(({isOverwrite}) => {
            console.log(111,isOverwrite);
            if (!isOverwrite) {
              console.log("Cancel");
              return;
            } else {
              // 选择 Overwirte ，先删除掉原有重名目录
              console.log("\r\nRemoving");
               fs.remove(targetDirectory);
            }
            // Use user feedback for... whatever!!
          }).catch(error => { throw error});
    }
  }
};
