exports.StartGitBug = () => {
    const defaults = {
        cwd: process.cwd(),
        env: process.env
    };
    console.log(defaults.cwd);
    const spawn = require('child_process').spawn;
    const ls = spawn('git-bug', ['webui', '--port',3010],defaults);

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
exports.SetGitBugIdentity = () => {


    const spawn = require('child_process').spawn;
    const user_create = spawn('git-bug', ['user', 'create',3010]);

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
        user_create.stdin.write(global.identity.name);
        console.log('setting email');
        setTimeout(function() {
        user_create.stdin.write(global.identity.email);
        }, 500);
        setTimeout(function() {
            user_create.stdin.write('\n');
        }, 700);
        setTimeout(function() {
            user_create.stdin.end();
        }, 2000);
    }, 1000);


}
exports.Initialize = () => {
    global.moduleConfig = {};
}
