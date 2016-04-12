var express = require('express');
var stormpath = require('express-stormpath');
var sqlLite = require('sqlite3');
var bodyParser = require('body-parser');

var app = express();
var db = new sqlLite.Database('storage/skoutr.db');

db.serialize(function() {
   db.run("CREATE TABLE IF NOT EXISTS matches (name TEXT, time TEXT, id TEXT, red TEXT, blue TEXT, tags TEXT)");
   db.run("CREATE TABLE IF NOT EXISTS comments (match TEXT, team INTEGER, rating REAL, category TEXT, comment TEXT, author INTEGER, id TEXT)");
   db.run("CREATE TABLE IF NOT EXISTS teams (name TEXT, number INTEGER, tags TEXT)");
   db.run("CREATE TABLE IF NOT EXISTS changes (user INTEGER, id TEXT, time TEXT)"); 
});


app.use(stormpath.init(app, {
  client: {
    apiKey: {
      id: '7K5CVKSWO3YRGPEQRALR0S960',
      secret: 'ca4FpSad84U1crFr2kyt0wTVOa68u4zm432lUlEy6Tk',
    }
  },
  website: true
}));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
   res.send("Hello");
});

app.get('/index', function(req, res) {
    res.json({a: 123});
});
/*
var commentSchema = new mongoose.Schema({
   team: Number,
   match: Number,
   category: String,
   rating: Number,
   text: String,
   author: Number,
   date: String
});

var matchSchema = new mongoose.Schema({
   name: String,
   time: Date,
   id: Number,
   red: [{team: Number}],
   blue: [{team: Number}],
   tags: [String]
});

var teamSchema = new mongoose.Schema({
   number: Number,
   name: String,
   panels: [{title: String, type: String, data: String}]
});

var logSchema = new mongoose.Schema({
    action: String,
    itemID: Number,
    value: String,
    date: Date
});

var Comment = mongoose.model('Comment', commentSchema);
var Match = mongoose.model('Match', matchSchema);
var Team = mongoose.model('Team', teamSchema);
var Log = mongoose.model('Log', logSchema);
*/
app.post('/add/comment', function(req, res) {
   var newComment = new Comment({
       team: req.body.team,
       match: req.body.match,
       category: req.body.category,
       rating: req.body.rating,
       author: req.body.author,
       date: req.body.time
   });
});

app.put('/match/:id', function(req, res) {
    var options = {};
    if (req.body.type == "+tag") {
        options = {$push: {tags: req.body.tag}};
    }
    else if (req.body.type == "-tag") {
        options = {$pull: {tags: req.body.tag}};
    }
    else {
        return;
    }
    Match.findOneAndUpdate({id: req.params.id}, options, {new: true}, function(err, doc) {
       if (err) throw err;
       res.json(doc.tags);
    });
});

app.post('/add/team', function(req, res) {
   var newTeam = new Team({
      number: req.body.num,
      name: req.body.name,
      panels: req.body.panels
   });

   newTeam.save(function(err) {
      if (err) throw err;
   });
   res.send('Done');
});

app.get('/team/:num', function(req, res) {
   Team.find({number: req.params.num}, function(err, data) {
       res.json(data);
   });
});

app.get('/comments/:num', function(req, res) {
   Comment.find({match: req.params.num}, function(err, data) {
       res.json(data);
   });
});

app.get('/match/:num', function(req, res) {
   Match.find({id: req.params.num}, function(err, data) {
       res.json(data[0]);
   });
});

app.on('stormpath.ready', function () {
    app.listen(3000);
    console.log("Ready!");
});
