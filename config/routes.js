/*!
 * Module dependencies.
 */

var async = require('async');

/**
 * Controllers
 */

var execSync = require('execSync');
var cp = require('child_process');
var http = require('http');
var fs = require('fs');
var express = require('express');

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

  var curl_proc = cp.spawn('curl' , [url]);
  var ans = '';
  curl_proc.stdout.on('data', function(chunk) {
    ans += chunk;
  })
  curl_proc.on('exit', function(code, signal) {
    if (code == 0) {
      try {
        return cb(null, JSON.parse(ans));
      } catch(e) {
        return cb("Error parsing");
      }
    } else {
      return cb(null);
    }
  });
}

module.exports = function (app) {
  app.use(express.static(__dirname + '/public'));

  app.get('/', function(req, res) {
    res.end('Check out our blog post on how we set this up!');
  });

  // FOR TESTING
  app.get('/test/terminal.json', function(req, res) {
    return res.send('{"startup": "blah"}');
    //return res.send('{"startup": "blah", "snapshot_id": "528c2d4957077e0000000006"}');
  });

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
      var startup_script = '';
      startup_script += '[ -d $REPOPATH ] && cloned=1 || cloned=0;';
      startup_script += 'if [ $cloned == 0 ] ; then git clone https://github.com/$USERNAME/$REPONAME $REPOPATH; fi;';
      startup_script += 'cd $REPOPATH;'
      startup_script += 'if [ $cloned == 1 ] ; then git fetch; fi;';
      startup_script += conf.startup + ';';

      startup_script = startup_script.replace(/\$USERNAME/g, username);
      startup_script = startup_script.replace(/\$REPONAME/g, repository);
      startup_script = startup_script.replace(/\$REPOPATH/g, conf.repo_path);

      console.log(startup_script)
      return startup_script;
      return "cd /home/; mkdir $REPONAME; echo \"read this\" >> README;"
    }

    function finish(conf) {
      conf = conf || {}
      conf.repo_path = conf.repo_path || ('/home/' + repository)
      conf.startup = conf.startup || "";
      conf.startup_script = get_startup_script(conf);

      conf.snapshot_id = conf.snapshot_id || '4f452850f26d9f22536c87be7b1834bd32cf2b53882d8833a6c2ad3304d2d1b2';

      var url = '//www.terminal.com/containers/anonNew/' + conf.snapshot_id
                                      + '?startup_script=' + encodeURIComponent(conf.startup_script)

      // port and path?

      console.log("STARTUP", conf.startup_script)
      //return res.redirect(url)
      return res.send(url)
    }

  });

}
