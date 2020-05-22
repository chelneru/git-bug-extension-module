const framework = require('./framework');

exports.StartGitBug = () => {
    const defaults = {
        cwd: process.cwd(),
        env: process.env
    };
    console.log(defaults.cwd);
    const spawn = require('child_process').spawn;
    const ls = spawn('git-bug', ['webui', '--port',3010,'--no-open'],defaults);

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

}

exports.LoadConfig = () => {
    global.sharedData = {};
    const appRoot = require('app-root-path').toString();
    if (fs.existsSync(path.join(appRoot, 'settings.json'))) {
        let rawdata = fs.readFileSync(path.join(appRoot,'settings.json'));
        global.moduleConfig = JSON.parse(rawdata.toString());
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
    const simpleGit = require('simple-git/promise')(path);
    return simpleGit.checkIsRepo().then(function (res) {
        if (res === false) {
            try {
                simpleGit.init().then(function () {
                    return {status: true};
                });

            } catch (e) {
                return {status: false, message: e.toString()};
            }
        }

    })
}

exports.PushRepository = async () => {
    try {
        global.git = require('simple-git/promise')(global.moduleConfig.repoPath);
        await global.git.getRemotes().then(function (result) {
            if (result.findIndex(i => i.name === 'distcollab') < 0) {
                return global.git.addRemote('distcollab', global.moduleConfig.bareRepoPath).then(function () {
                    return execCommand(['git bug','push','distcollab']);
                });
            }
            else {
                return execCommand(['git bug','push','distcollab']);

            }
        });

        framework.PublishData(global.moduleConfig.bareRepoPath,'git-bare-repo');
    } catch (e) {
        console.log('error pushing:', e.toString());

        return {status: false, message: e.toString()};

    }
    return {status: true};
}
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function execCommand(command) {
    const { stdout, stderr } = await exec(command);
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
}
exports.PullRepository = async () => {
    try {
        global.git = require('simple-git/promise')(global.moduleConfig.repoPath);

        framework.SyncronizeData(global.moduleConfig.bareRepoPath);
        await global.git.getRemotes().then(function (result) {
            if (result.findIndex(i => i.name === 'distcollab') < 0) {
                return global.git.addRemote('distcollab', global.moduleConfig.bareRepoPath).then(function () {
                    return execCommand(['git bug','pull','distcollab']);
                });
            }
            else {
                return execCommand(['git bug','pull','distcollab']);

            }
        });
        return {status: true};

    } catch (e) {
        console.log('error pulling:', e.toString());

        return {status: false, message: e.toString()};

    }
}
exports.CreateBareRepo = async (bareRepoPath) => {
    global.git = require('simple-git/promise')();
    try {
        if (!fs.existsSync(bareRepoPath)) {
            global.git.clone(global.moduleConfig.repoPath, bareRepoPath, ['--bare']);
        }

    } catch (e) {
        console.log('Error cloning the repository for bare repo:', e.toString());
    }
}
exports.AddBug = (title,message) => {
    const axios = require('axios');

    let query = `mutation{
  newBug(input: { title: "`+title+`" message: "`+message+`" }) {
    bug {
      title status
    }
  }
}`;

    axios.post('http://127.0.0.1:3010/graphql', {query:query})
        .then((res) => {console.log(res.data)}
        )
        .catch((error) => {
            console.error(error)
        });
}
exports.SetGitBugIdentity = (name,email) => {


    const spawn = require('child_process').spawn;
    const user_create = spawn('git-bug', ['user', 'create']);

    user_create.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    user_create.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    user_create.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

    setTimeout(function() {
        console.log('setting name');
        user_create.stdin.write(name);
        user_create.stdin.write("\n");
        setTimeout(function () {
            user_create.stdin.write(email);
            user_create.stdin.write('\n');

        },100)
        setTimeout(function () {
            user_create.stdin.write("");
            user_create.stdin.write('\n');

        },200)
        user_create.stdin.write('\n\n');



    }, 1000);


}
exports.Initialize = () => {
    global.moduleConfig = {};
}
