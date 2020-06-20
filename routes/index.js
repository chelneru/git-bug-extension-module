var express = require('express');
var router = express.Router();
const internal = require('../app/internal');
const framework = require('../app/framework');
/* GET home page. */
router.get('/', async function (req, res, next) {

    if (global.connected === false) {
        return res.redirect('/loading');
    }
    if (global.moduleConfig.repoPath !== undefined && global.moduleConfig.identity.projectPath == global.framework_projectPath) {
        //show the normal interface with buttons
    } else {
        //show interface to input repoPath
        return res.redirect('/set-repo');

    }
    if(global.moduleConfig.setIndentity !== true) {
        internal.SetGitBugIdentity(global.moduleConfig.identity.name,global.moduleConfig.identity.email);
        global.moduleConfig.setIndentity = true;
        internal.SaveConfig();
        // if (global.started_gitbug === false) {
        //     setTimeout(function () {
        //         internal.StartGitBug();
        //     }, 7000);
        // }
    }
    else {
        if (global.started_gitbug === false) {
            global.started_gitbug = true;

        internal.StartGitBug();
    }
    }

    internal.CreateBareRepo(global.moduleConfig.bareRepoPath);
    res.render('home');
});

router.post('/status', async function (req, res, next) {
    return res.json({status: global.connected});
});

router.get('/set-repo', function (req, res, next) {

    res.render('set-repo');
});
router.get('/loading', async function (req, res, next) {
    return res.render('loading');
});

router.post('/add-bug', async function (req, res, next) {
    let title = req.body.title;
    let description = req.body.description;
    internal.AddBug(title, description);
    return res.render('loading');
});
router.post('/set-repo', async function (req, res, next) {
    global.moduleConfig.repoPath = req.body.repo;
    if (global.moduleConfig.identity.is_author === false) {
        //retrieve data
        await framework.SyncronizeData('git-bare-repo', global.moduleConfig.repoPath);
        await internal.CreateRepository(global.moduleConfig.repoPath);
    } else {
        await internal.CreateRepository(global.moduleConfig.repoPath);
    }
    internal.CreateBareRepo(global.moduleConfig.bareRepoPath);
    const fs = require('fs');
    const path = require('path');
    fs.copyFileSync('git-bug.exe',path.join(global.moduleConfig.repoPath,'git-bug.exe'));
    if(global.moduleConfig.setIndentity !== true) {
        internal.SetGitBugIdentity(global.moduleConfig.identity.name,global.moduleConfig.identity.email);
        global.moduleConfig.setIndentity = true;
    }
    internal.SaveConfig();

    // if (global.started_gitbug === false) {
    //
    //     setTimeout(function () {
    //         internal.StartGitBug();
    //     }, 7000);
    // }
    return res.redirect('/');
});

module.exports = router;
