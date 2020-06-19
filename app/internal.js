const framework = require('./framework');
const fs = require('fs');
const path = require('path');
exports.StartGitBug = () => {
    global.started_gitbug = true;

    const defaults = {
        cwd: global.moduleConfig.repoPath,
        env: process.env
    };
    let gitbugExePath = path.join(global.moduleConfig.repoPath, 'git-bug.exe');
        console.log('(Starting)Gitbug executable path : ',gitbugExePath);
    if (fs.existsSync(gitbugExePath)) {
        const spawn = require('child_process').spawn;
        const ls = spawn(gitbugExePath, ['webui', '--port', 3010, '--no-open'], defaults);

        ls.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        ls.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        ls.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    } else {
        console.log('Error starting gitbug: Gitbug executable not found in the repository folder at :' + gitbugExePath)
    }
}

exports.LoadConfig = () => {
    global.sharedData = {};
    const appRoot = require('app-root-path').toString();
    if (fs.existsSync(path.join(appRoot, 'settings.json'))) {

        try {
            let rawdata = fs.readFileSync(path.join(appRoot, 'settings.json'));
            global.moduleConfig = JSON.parse(rawdata.toString());
        } catch (e) {
            console.log('Error loading config from settings file. The file does not have valid JSON:', e.toString());
            global.moduleConfig = {};
            exports.SaveConfig();
        }
    } else {
        global.moduleConfig = {};
        exports.SaveConfig();
    }
}
exports.SaveConfig = async () => {
    const appRoot = require('app-root-path').toString();
    return fs.writeFile(path.join(appRoot, 'settings.json'), JSON.stringify(global.moduleConfig), (err) => {
        if (err) {
            console.log('Error saving config file:', err.toString());
        }
    });
}
exports.CreateRepository = async (path) => {
    try {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    const git = require('simple-git/promise')(path);
    return await git.checkIsRepo().then(async function (res) {
        if (res === false) {
            //try to clone from bare repository
            if (fs.existsSync(global.moduleConfig.bareRepoPath)) {

                try {
                    await git.clone(global.moduleConfig.repoPath, global.moduleConfig.bareRepoPath);
                } catch
                    (e) {
                    console.log('Gitbug: Error cloning the repository for bare repo:', e.toString());
                }
            } else {
                //initialize a new repository
                try {
                    git.init().then(function () {
                        return {status: true};
                    });

                } catch (e) {
                    console.log('Gitbug: Error creating repository:', e.toString())
                    return {status: false, message: e.toString()};
                }
            }
        }

    })
    }catch (e) {
        console.log('Gitbug extension: Error creating repository at '+path+': ',e.toString())
    }
}

exports.PushRepository = async () => {
    try {
      let git = require('simple-git/promise')(global.moduleConfig.repoPath);
        await git.getRemotes().then(async function (result) {
            if (result.findIndex(i => i.name === 'colligo') < 0) {
                return git.addRemote('colligo', global.moduleConfig.bareRepoPath).then(function () {
                    return execCommand(['git bug', 'push', 'colligo']);
                });
            } else {
                await git.remote(['set-url','colligo',global.moduleConfig.bareRepoPath])
                return execCommand(['git bug', 'push', 'colligo']);

            }
        });

        framework.PublishData(global.moduleConfig.bareRepoPath, 'git-bare-repo');
    } catch (e) {
        console.log('gitbug extension: error pushing:', e.toString());

        return {status: false, message: e.toString()};

    }
    return {status: true};
}
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function execCommand(command) {
    const {stdout, stderr} = await exec(command);
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
}

exports.PullRepository = async () => {
    try {
        let git = require('simple-git/promise')(global.moduleConfig.repoPath);

        framework.SyncronizeData(global.moduleConfig.bareRepoPath);
        await git.getRemotes().then(async function (result) {
            if (result.findIndex(i => i.name === 'colligo') < 0) {
                return git.addRemote('colligo', global.moduleConfig.bareRepoPath).then(function () {
                    return execCommand(['git bug', 'pull', 'colligo']);
                });
            } else {
                await git.remote(['set-url','colligo',global.moduleConfig.bareRepoPath])
                return execCommand(['git bug', 'pull', 'colligo']);

            }
        });
        return {status: true};

    } catch (e) {
        console.log('gitbug extension: error pulling:', e.toString());

        return {status: false, message: e.toString()};

    }
}
exports.CreateBareRepo = async (bareRepoPath) => {
    let git = require('simple-git/promise')();
    try {

        if (!fs.existsSync(bareRepoPath)) {
            console.log('gitbug: Creating bare repo at ',bareRepoPath);

            await git.clone(global.moduleConfig.repoPath, bareRepoPath, ['--bare']);
        }

    } catch (e) {
        console.log('gitbug: Error cloning the repository for bare repo:', e.toString());
    }
}
exports.AddBug = (title, message) => {
    const axios = require('axios');

    let query = `mutation{
  newBug(input: { title: "` + title + `" message: "` + message + `" }) {
    bug {
      title status
    }
  }
}`;

    axios.post('http://127.0.0.1:3010/graphql', {query: query})
        .then((res) => {
                console.log(res.data)
            }
        )
        .catch((error) => {
            console.error(error)
        });
}
exports.SetGitBugIdentity = (name, email) => {


    let gitbugExePath = path.join(global.moduleConfig.repoPath,'git-bug.exe');
    console.log('(Setting identity )Gitbug executable path : ',gitbugExePath);

    if (fs.existsSync(gitbugExePath)) {
        const defaults = {
            cwd: global.moduleConfig.repoPath,
            env: process.env
        };
        const spawn = require('child_process').spawn;
        const user_create = spawn(gitbugExePath, ['user', 'create'],defaults);

        user_create.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        user_create.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        user_create.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });

        setTimeout(function () {
            console.log('setting name');
            user_create.stdin.write(name);
            user_create.stdin.write("\n");
            setTimeout(function () {
                user_create.stdin.write(email);
                user_create.stdin.write('\n');

            }, 100)
            setTimeout(function () {
                user_create.stdin.write("");
                user_create.stdin.write('\n');

            }, 200)
            user_create.stdin.write('\n\n');


        }, 1000);

    }
    else{
        console.log('Unable to set Gitbug Identity:Gitbug executable not found in the repository folder at :' + gitbugExePath)
    }
}
exports.Initialize = () => {
    global.moduleConfig = {};
}
