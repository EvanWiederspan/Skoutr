var skoutr = angular.module('skoutr');
//var Tingo = require('tingodb')();
var sqlLite = require('sqlite3').verbose();
var result_test = {};

skoutr.factory('ConnectService', function() {
    var connectService = {};
    var connected = true;
    
    connectService.isConnected = function() {
        return connected;
    };
    
    return connectService;
});

skoutr.factory('LocalStorageService', ['$http', 'UserService', function($http, UserService) {
    var localStorageFactory = {};
    var db = new sqlLite.Database('storage/skoutr-local.db');
    
    db.serialize(function() {
       db.run("CREATE TABLE IF NOT EXISTS matches (name TEXT, time TEXT, id TEXT, red TEXT, blue TEXT, tags TEXT)");
       db.run("CREATE TABLE IF NOT EXISTS comments (match TEXT, team INTEGER, rating REAL, category TEXT, comment TEXT, author INTEGER, id TEXT)");
       db.run("CREATE TABLE IF NOT EXISTS teams (name TEXT, number INTEGER, tags TEXT)");
       db.run("CREATE TABLE IF NOT EXISTS changes (user INTEGER, id TEXT, time TEXT)");
    //     $http({
    //        method: 'GET',
    //        url: 'http://www.thebluealliance.com/api/v2/event/2013wase/teams',
    //        headers: {'X-TBA-App-Id': 'frc3663:scouting-app-test:v01'}
    //    }).then(function(response) {
    //        console.log(response);
    //         var result = response.data;
    //        // console.log(result[0].team_number);
    //         for (var i = 0; i < result.length; i++) {
    //             db.run("INSERT INTO teams(name, number, tags) VALUES ('" + result[i].name + "', " + result[i].team_number  + ", '')");
    //         }
    //     }); 
    });
    
    // localStorageFactory.loadSampleMatches = function() {
    //     $http.get('http://www.thebluealliance.com/api/v2/event/2013wase/matches').then(function(response) {
    //         var result = response.data;
    //         for (var i = 0; i < result.length; i++) {
    //             var match = result[i];
    //             var id = match.comp_level + match.match_number;
    //             var red = match.alliances.red.teams[0].substring(3) + ',' + match.alliances.red.teams[1].substring(3) + ',' + match.alliances.red.teams[2].substring(3);
    //             var blue = match.alliances.blue.teams[0].substring(3) + ',' + match.alliances.blue.teams[1].substring(3) + ',' + match.alliances.blue.teams[2].substring(3);
    //             db.run("INSERT INTO matches(name, time, id, red, blue, tags) VALUES ('" + id + "', '" + match.time_string  + "', '" + id + "', '" + red + "', '" + blue + "', '')");
    //         }
    //     });
    // };
    
    localStorageFactory.loadSampleMatches = function() {
    //    $http({
    //        method: 'GET',
    //        url: 'http://www.thebluealliance.com/api/v2/event/2013wase/matches',
    //        headers: {'X-TBA-App-Id': 'frc3663:scouting-app-test:v01'}
    //    }).then(function(response) {
    //        console.log(response.data[0]);
    //        db.exec("BEGIN");
    //        for (var i = 0; i < response.data.length; i++) {
    //           var result = response.data[i];
    //           var id = result.key.substring(9);
    //           var red = "," + result.alliances.red.teams[0].substring(3) + "," + result.alliances.red.teams[1].substring(3) + "," + result.alliances.red.teams[2].substring(3) + ",";
    //           var blue = "," + result.alliances.blue.teams[0].substring(3) + "," + result.alliances.blue.teams[1].substring(3) + "," + result.alliances.blue.teams[2].substring(3) + ",";
    //           db.run("INSERT INTO matches(name, time, id, red, blue, tags) VALUES (?,?,?,?,?,?)", id, result.time_string, id,
    //            red, blue, "");
    //        }
    //        db.exec("COMMIT");
    //    }); 
    };
    
    // Expects comment to be formatted
    localStorageFactory.addTeamComment = function(teamNum, comment) {
        db.all("SELECT COUNT() as count FROM comments WHERE author = ?", comment.author, function(err, rows) {
            if (err) console.log(err);
            var result = rows[0];
            db.run("INSERT INTO comments(team, rating, category, comment, author, id) VALUES (?,?,?,?,?,?,?)",
        [comment.team, comment.rating, comment.category, comment.text, UserService.getUserID(), UserService.getUserID() + "-" + result.count], function(err, rows) {
            if (err) console.log(err);
            else {
                db.run("INSERT INTO changes(user, id, time) VALUES (" + UserService.getUserID() + " )");
            }
        });
        });
        
    };
    
    localStorageFactory.addMatchComment = function(matchNum, comment) {
        db.all("SELECT COUNT() as count FROM comments WHERE author = ?", comment.author, function(err, rows) {
            if (err) console.log(err);
            var result = rows[0];
            db.run("INSERT INTO comments(match, team, rating, category, comment, author, id) VALUES (?,?,?,?,?,?,?)",
        [comment.match, comment.team, comment.rating, comment.category, comment.text, UserService.getUserID(), UserService.getUserID() + "-" + result.count], function(err, rows) {
            if (err) console.log(err);
        });
        });
        
    };
    
    localStorageFactory.addMatchTag = function(matchID, newTag) {
        db.all("SELECT tags FROM matches WHERE id=?", matchID, function(err,rows) {
            if (err) console.log(err);
            var tags = rows[0].tags;
            if (tags.search("," + newTag + ",") == -1) {
                tags += newTag + ",";
                db.run("UPDATE matches SET tags = ? WHERE id = ?", tags, matchID, function(err, rows) {
                    if (err) console.log(err);
                });
            }
        });
    };
    
    localStorageFactory.removeMatchTag = function(matchID, oldTag) {
      db.all("SELECT tags FROM matches WHERE id=?", matchID, function(err,rows) {
            if (err) console.log(err);
            var tags = rows[0].tags.replace("," + oldTag + ",", ",");
            db.run("UPDATE matches SET tags = ? WHERE id = ?", tags, matchID, function(err, rows) {
                if (err) console.log(err);
            });
        });
    };
    
    localStorageFactory.getMatchComments = function(matchNum, callback) {
         db.all("SELECT * FROM comments WHERE match=?", matchNum, function(err, rows) {
        //     db.all("SELECT COUNT() FROM teams LIMIT 20", function(err, rows) {
            if (err) console.log(err);
             callback(rows);
        });
    };
    
    localStorageFactory.getMatchData = function(matchID, callback) {
        db.all("SELECT * FROM matches WHERE id=?", matchID, function(err, rows) {
            if (err) console.log(err);
            var teams = rows[0].red.split(",").slice(1,4).concat(rows[0].blue.split(",").slice(1,4));
            db.all("SELECT name, number FROM teams WHERE number IN (?,?,?,?,?,?)", teams[0], teams[1], teams[2], teams[3], teams[4], teams[5], function(err, names) {
                var teamNames = {};
                for (var i = 0; i < names.length; i++) {
                    teamNames[names[i].number] = names[i].name;
                }
                rows[0].names = teamNames;
                callback(rows[0]);
            });
        });
    };
    
    localStorageFactory.getTeam = function(num, teamCallback, commentCallback) {
    //    teams.findOne({number: num}, function(err, data) {
    //        if (err) console.log(err);
    //        teamCallback(data);
    //    });
    //    comments.find({team: num}, function(err, data) {
    //        if (err) console.log(err);
    //        commentCallback(data);
    //    });
    };
    
    localStorageFactory.addTeam = function(newTeam) {
    //    teams.insert(newTeam, function(err, data) {
    //       if (err) console.log(err); 
    //    });
    };
    
    return localStorageFactory;
}]);
