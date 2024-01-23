// Creator.js
const path = require("path")
const util = require("util")
const fs = require("fs-extra")
const downloadGitRepo = require("download-git-repo")
const Inquirer = require("inquirer")
const { getZhuRongRepo, getTagsByRepo } = require("./api")
const ora = require("ora")

// 获取模板信息及用户最终选择的模板
async function getRepoInfo() {
	// 获取组织下的仓库信息
	let repoList = await getZhuRongRepo().catch((err) => {})
	// 提取仓库名
	const repos = repoList.map((item) => item.name)
	// 选取模板信息
	let { repo } = await new Inquirer.prompt([
		{
			name: "repo",
			type: "list",
			message: "Please choose a template",
			choices: repos,
		},
	])
	return repo
}

// 获取版本信息及用户选择的版本
async function getTagInfo(repo) {
	let tagList = await getTagsByRepo(repo).catch((err) => {})
	const tags = tagList.map((item) => item.name)
	// 选取模板信息
	let { tag } = await new Inquirer.prompt([
		{
			name: "repo",
			type: "list",
			message: "Please choose a version",
			choices: tags,
		},
	])
	return tag
}

/**
 * 睡觉函数
 * @param {Number} n 睡眠时间
 */
function sleep(n) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve()
		}, n)
	})
}

async function loading(message, fn, ...args) {
	const spinner = ora(message)
	spinner.start() // 开启加载
	try {
		let executeRes = await fn(...args)
		// 加载成功
		spinner.succeed()
		return executeRes
	} catch (error) {
		// 加载失败
		spinner.fail("request fail, refetching")
		//   await sleep(1000);
		// 重新拉取
		//   return loading(message, fn, ...args);
	}
}

class Creator {
	// 项目名称及项目路径
	constructor(name, target) {
		this.name = name
		this.target = target
		this.downloadGitRepo = util.promisify(downloadGitRepo)
	}
	async download(repo, tag) {
		// 模板下载地址
		// const templateUrl = `zhurong-cli/${repo}${tag ? "#" + tag : ""}`;
		const templateUrl = `vitereact/${repo}${tag ? "#" + tag : ""}`

		// const templateUrl = `qdleader/reactAdminPro`;
		// const templateUrl = `gitlab:rock-frontend/alpha-arch-admin-main`;

		// const templateUrl = `https://github.com/qdleader/reactAdminPro.git`;
		// const templateUrl = `https://code.alphalawyer.cn/rock-frontend/cem-app.git`;
		// 调用 downloadGitRepo 方法将对应模板下载到指定目录
		await loading(
			"downloading template, please wait",
			this.downloadGitRepo,
			templateUrl,
			path.resolve(process.cwd(), this.target) // 项目创建位置
			// path.join(process.cwd(), this.target) // 项目创建位置
		)
	}
	// 创建项目部分
	async create() {
		console.log(this.name, this.target)
		let repo = await getRepoInfo().catch((err) => console.log(err))
		let tag = await getTagInfo(repo).catch((err) => console.log(err))
		console.log(222, repo, tag)
		this.download(repo, tag)
	}
}

module.exports = Creator
