var express = require('express');
var app = express();


var redis = require("redis"),
    redisclient = redis.createClient(YOUR_REDIS_INFORMATION);


redisclient.auth(YOUR_REDIS_KEY, function (err) {
 if (err) { throw err; }
 // You are now connected to your redis.
 console.log("connected to REDIS...");
});



app.use('/', express.static(__dirname + '/site'));

app.use(function numberMiddleware(req, res, next) {
  // req.url starts with "/bar"
  var urlObj = require('url').parse(req.url, true)
  
  var path = urlObj.pathname.replace('/','');
  console.log("path:" + path);
  if (path !="index.html")
  {
    if (urlObj.query["setBuildNumber"])
    {
      if (isNaN(urlObj.query["setBuildNumber"]))
      {
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end("NOT A NUMBER");
          return;
      } else
      {
        redisclient.set(path,urlObj.query["setBuildNumber"]);
      }
    }
    redisclient.get(path, function(err, reply){
      if (err)
      {
        redisclient.set(path,"-1");
      }
      if (urlObj.search != "?currentBuildNumber")
      {
        console.log('incrementing build number:' + req.path)
        redisclient.incr(path);
      }
      redisclient.get(path, function(err, reply){
        if (err)
        {
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end("NOT FOUND");
        } else
        {
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end(reply);
        }
      });
        
      

    });

  }
});
app.listen(80, function() { console.log('listening')});