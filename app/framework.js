const axios = require('axios');
const internal = require('./internal');
const path = require('path');
exports.GetIdentity = () => {
    axios.interceptors.response.use(
        function (response) {
            global.connected = true;
            return response;
        },
        function (err) {
            if (err.code === "ECONNREFUSED") {
                //we cannot reach the framework.
                console.log('Cannot reach framework.')
            }

            return Promise.reject(err);
        }
    );
    axios.post('http://localhost:3000/extension/identity', {
        name: 'gitbug',
    })
        .then(async (res) => {
            if (res.data.status === true) {
                let new_identity = {
                    name: res.data.identity.name,
                    email: res.data.identity.email,
                    is_author: res.data.identity.is_author,
                    projectPath: res.data.identity.projectPath
                };

                global.moduleConfig.identity = {...global.moduleConfig.identity, ...new_identity}; //update new identity
                global.moduleConfig.bareRepoPath = path.join(global.moduleConfig.identity.projectPath, 'git-extension', 'bare-repo');
                console.log('Retrieved identity for git-bug successfully!');

                console.log('done initializing gitbug extension');
            } else {
                console.log('Failed to get valid identity information.');

            }
        })
        .catch((error) => {
            console.error('Error getting identity information:', error.toString());
            if (global.connected === false) {
                setTimeout(function () {
                    exports.GetIdentity();
                }, 3000);
            }
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
exports.PublishData = (bareRepoLocalPath,folderName) => {
    // publishing data for this extension modules means we will publish hash for the bare repo
    axios.post('http://localhost:3000/extension/publish-data', {
            name:'gitbug',
            path: bareRepoLocalPath,
            folder: folderName,
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

exports.SyncronizeData = (folderName, targetPath) => {
    // syncronizing data for this extension modules means we will update the local repo
    axios.post('http://localhost:3000/extension/update-data', {
            name: 'git',
            path: targetPath,
            folder: folderName
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


