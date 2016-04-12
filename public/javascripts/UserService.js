var skoutr = angular.module('skoutr', ['ui.router']);
var fs = require('fs');

skoutr.factory('UserService', ['$http', function($http) {
    var userService = {};
    userService.users = [];

    if (localStorage.users) {
      userService.users = localStorage.users;
    }
    // fs.read('../storage/users.txt', 'w+', function(err, fd) {
    //     if (err) console.log(err);
    // });

    userService.currUser = {name: "Guest", id: 0};

    userService.getUsers = function() {
      var users = [];
      if (userService.users)
        users = userService.users;
      users.push({name: "Guest", id: 0});
      return users;
    };

    userService.getUserID = function() {
        return userService.currUser.id;
    };

    userService.workAs = function(userName) {
       var users = userService.getUsers();
       for (var i = 0; i < users.length; i++) {
         if (users[i].name === userName) {
             userService.currUser.id = users[i].id;
             userService.currUser.name = userName;
            return userName;
         }
       }
       return false;
    };

    userService.createUser = function() {

    };

    userService.login = function() {

    };

    return userService;
}]);
