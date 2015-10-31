var express = require('express');
var app = express();

// loads static files from public folder
app.use('/public', express.static(__dirname + '/public'));

// Route anlegen
app.get('/*', function (req, res) {
    //console.log(res);
    res.send('<!DOCTYPE html>' +
        '<html lang="de">' +
        '<head><meta charset="utf-8"></head>' +
        '<body><h1>Hello World!</h1></body>' +
        '</html>'
    );
});

//app.use("/public", );
var server = app.listen(3000, function () {
    console.log('helloworld app is ready and listening at http://localhost:3000');
});