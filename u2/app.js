var express = require('express');
var fs = require('fs')
var app = express();

// Aufgabe 3 loads static files from public folder
app.use('/public', express.static(__dirname + '/public'));

// Aufgabe 4
app.get('/time', function (req, res) {
    var date = new Date();
    var current_time =  date.getDate() + "/" +
                        (date.getMonth()+1)  + "/" +
                        date.getFullYear() + " | " +
                        date.getHours() + ":" +
                        date.getMinutes() + ":" +
                        date.getSeconds();
    res.header("Content-Type", "text/plain");
    res.send("the time is: " + current_time + "\n" +"content-type is: " + res.get('Content-Type'));
});

// Aufgabe 5a
app.get('/file', function (req, res) {

    var path = "./file/file.txt";
    var data = "It's a new filefile new new  new file";
    var start, end;

   /* fs.writeFile(path, data, { flags: 'wx' }, function (err) {
        if (err) throw err;
        console.log("File created");
    });*/

    start = process.hrtime(); // start time

    var content = fs.readFile(path, 'utf-8', function(err, data) {
        if (err) throw err;
        end = process.hrtime(start); // execution time
        res.send("execution time: " + end + "ms" + "<br /><br />" + data);
    });

});

// Aufgabe 1 route anlegen
app.get('*', function (req, res) {
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