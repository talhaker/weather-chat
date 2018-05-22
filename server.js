var express = require('express');
var app = express();
app.listen(8000, console.log("Server running on port 8000. Enjoy!"));

app.use(express.static('node_modules'));
app.use(express.static('public'));
app.get('/', function(request, response) {
    response.send("Hello world!");
});