var url = 'https://m.chase.com/PSRWeb/location/list.action?lat=40.147864&lng=-82.990959';

var http = require('http');

http.get(url, function(res) {
    var body = '';

    res.on('data', function(chunk) {
        body += chunk;
    });

    res.on('end', function() {
        var chaseResponse = JSON.parse(body)
        console.log("Got response: ", chaseResponse);
    });
}).on('error', function(e) {
      console.log("Got error: ", e);
});


var app = http.createServer(function(req,res){
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(chaseResponse, null, 3));
});
app.listen(3000);