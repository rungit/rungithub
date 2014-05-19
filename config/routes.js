/*!
 * Module dependencies.
 */

var async = require('async')

/**
 * Controllers
 */

var execSync = require('execSync');
var cp = require('child_process');
var http = require('http');
var fs = require('fs')
var express = require('express')

var maindir = '/root/github_setup';

function curl_json(url, cb) {
  //http.get(url, function(resp){
  //  var ans = '';
  //  resp.on('data', function(chunk){
  //    ans += chunk;
  //  });
  //  resp.on('end', function(){
  //    console.log("GOT", ans)
  //    res.end(ans)
  //  });
  //}).on("error", function(e){
  //  console.log("Got error: " + e.message);
  //});

  var curl_proc = cp.spawn('curl' , [url])
  var ans = ''
  curl_proc.stdout.on('data', function(chunk) {
    ans += chunk;
  })
  curl_proc.on('exit', function(code, signal) {
    if (code == 0) {
      try {
        return cb(null, JSON.parse(ans))
      } catch(e) {
        return cb("Error parsing")
      }
    } else {
      return cb(null)
    }
  })
}

module.exports = function (app) {

  app.get('/', function(req, res) {
    res.end('Check out our blog post on how we set this up!');
  })

  // FOR TESTING
  app.get('/test/terminal.json', function(req, res) {
    return res.send('{"startup": "blah"}');
    //return res.send('{"startup": "blah", "snapshot_id": "528c2d4957077e0000000006"}');
  })

  app.get('/:username/:repository', function(req, res) {
    var username = req.param('username');
    var repository = req.param('repository');
    var repopath = username + '/' + repository;

    var url = 'https://raw.github.com/' + repopath + '/master/terminal.json'

    // FOR TESTING
    var url = 'localhost:3000/test/terminal.json'

    curl_json(url, function(err, result) {
      if (err) { return finish({});}

      if (result == null) {
        var url = 'https://raw.github.com/' + repopath + '/master/.terminal.json'
        curl_json(url, function(err, result) {
          if (err) { return finish({});}
          if (result == null) {
             return finish({});
          }
          return finish(result);

        });
      } else {
        return finish(result);
      }
    })

    function get_startup_script(conf) {

      var startup_script = "";
      if (conf.clone) {
         startup_script += "git clone https://github.com/$USERNAME/$REPONAME $REPOPATH;"
      }
      startup_script += 'cd $REPOPATH;'
      if (conf.fetch) {
         startup_script += "git fetch;"
      }
      startup_script += conf.startup + ';';
      startup_script = startup_script.replace(/\$USERNAME/g, username);
      startup_script = startup_script.replace(/\$REPONAME/g, repository);
      startup_script = startup_script.replace(/\$REPOPATH/g, conf.repo_path);

      console.log(startup_script)
      return startup_script;
      return "cd /home/; mkdir $REPONAME; echo \"asdf\" >> README;"
    }

    function finish(conf) {
      conf = conf || {}
      conf.repo_path = conf.repo_path || ('/home/' + repository)
      conf.clone = conf.clone || (!conf.snapshot_id);
      conf.fetch = conf.fetch || (!!conf.snapshot_id);
      conf.startup = conf.startup || "";
      conf.startup_script = get_startup_script(conf);

      conf.snapshot_id = conf.snapshot_id || '52e2cdf8a581060000000003';

      var url = '//www.terminal.com/containers/anonNew/' + conf.snapshot_id
                                      + '?startup_script=' + encodeURIComponent(conf.startup_script)

      var port = 3000;
      //var url = '//www.terminal.com/containers/anonFromTemplate/' + conf.snapshot_id
              // + '?startup_script=' + encodeURIComponent(conf.startup_script)
              //+ '?port=' + port + '&path=' + encodeURIComponent(repopath);

      console.log("STARTUP", conf.startup_script)
      //return res.redirect(url)
      return res.send(url)
    }

  })

}
