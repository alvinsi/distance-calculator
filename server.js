var express = require('express');
var exphbs = require('express3-handlebars');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.get('/', function(req, res) {
	res.render('home');
});

app.use(express.static(__dirname + '/public'));

app.listen(PORT, function() {
	console.log('Express listening on port: ' + PORT);
});