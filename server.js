var express = require('express');
var app = express();
app.listen(8000);

app.use(express.static('node_modules'));
app.use(express.static('public'));
app.get('/', function(request, response) {
    response.send("Hello world!");
});