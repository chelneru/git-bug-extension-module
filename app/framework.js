const axios = require('axios');
const internal = require('./internal');

exports.GetIdentity = () => {
    console.log('Getting gitbug identity....');
    axios.post('http://localhost:3000/extension/identity', {
        name: 'gitbug',
    })
        .then((res) => {
            // console.log(`statusCode: ${res.statusCode}`)
            if(res.data.status === true) {
                console.log(JSON.stringify(res.data));
                global.identity = {
                    name: res.data.identity.name,
                    email: res.data.identity.email,
                    folderPath: res.data.identity.folderPath,
                    projectPath: res.data.identity.projectPath
                };
                global.moduleConfig = res.data.config;
                console.log('Retrieved identity for gitbug successfully!');
                internal.SetGitBugIdentity(global.identity.name,global.identity.email);

            }
            else {
                console.log('Failed to get valid identity information.');

            }
        })
        .catch((error) => {
            console.error(error)
        })

};

exports.UpdateConfig = () => {

    axios.post('http://localhost:3000/extension/update-config', {
        config:{
            name:'gitbug',
            config:global.moduleConfig
        }
    })
        .then((res) => {
            if(res.data.status) {
                console.log('Config stored successfully!');
            }
        })
        .catch((error) => {
            console.error(error)
        })

};
exports.PublishSharedData =(sharedData) => {
    axios.post('http://localhost:3000/extension/publish-shared-data', {
            name:'gitbug',
            data: sharedData
        }
    )
        .then((res) => {
            if (res.data.status) {
                console.log('Shared data published successfully!');
            }
        })
        .catch((error) => {
            console.error(error)
        })
}
exports.PublishData = (bareRepoLocalPath) => {
    // publishing data for this extension modules means we will publish hash for the bare repo
    axios.post('http://localhost:3000/extension/publish-data', {
            name:'gitbug',
            path: bareRepoLocalPath
        }
    )
        .then((res) => {
            if (res.data.status) {
                console.log('Bare repo published successfully!');
            }
        })
        .catch((error) => {
            console.error(error)
        })
}

exports.SyncronizeData = (bareRepoLocalPath) => {
    // syncronizing data for this extension modules means we will update the local repo
    axios.post('http://localhost:3000/extension/update-data', {
            name:'gitbug',

            path: bareRepoLocalPath
        }
    )
        .then((res) => {
            if (res.data.status) {
                console.log('Bare repo updated successfully!');
            }
        })
        .catch((error) => {
            console.error(error)
        })
}

