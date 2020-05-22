var express = require('express');
var router = express.Router();
const internal = require('../app/internal');
const framework = require('../app/framework');
/* GET home page. */
router.get('/', async function(req, res, next) {

  if(global.connected === false) {
    return res.redirect('/loading');
  }
  if(global.moduleConfig.repoPath !== undefined) {
    //show the normal interface with buttons
  }
  else {
    //show interface to input repoPath
    return res.redirect('/set-repo');

  }
  setTimeout(function () {
    internal.StartGitBug();



  // internal.AddBug('testfromcode','messagefromcode');
  },5000);

  res.render('home' );
});

router.post('/status', async function (req, res, next) {
  return res.json({status:global.connected});
});

router.get('/set-repo', function(req, res, next) {

  res.render('set-repo');
});
router.get('/loading', async function (req, res, next) {
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
  internal.StartGitBug();

  return res.redirect('/');
});

module.exports = router;