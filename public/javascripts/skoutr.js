var skoutr = angular.module('skoutr');
var cursor = {};
skoutr.factory('OnlineFactory', function() {
    var self = this;
    var online = {};
    var isOnline = true;
    
    online.isOnline = function() {
      return isOnline;  
    };
    
    online.setOnline = function(online) {
        self.isOnline = online;
    };
    
    return online;
});

skoutr.factory('CommentFactory', ['$http', function($http) {
    var comments = {};
    comments.getComments = function(matchID) {
        return $http.get('comments/' + matchID);
    };
    
    comments.getTest = function() {
        return "HELLO";
    };
    
    comments.addComment = function() {
        
    };
    
    return comments;
}]);

skoutr.controller('AdminController', ['$stateParams', 'LocalStorageService', function($stateParams, LocalStorageService){
    var self = this;
    this.teams = [{num: 3663, name: "CPR Robotics"}];
    
        this.newTeam = {
       teamNum: "",
       teamName: "",
       panels: []
    };
    
    this.loadSamples = function() {
       LocalStorageService.loadSampleMatches(); 
    };
    
    this.addTeam = function() {
        LocalStorageService.addTeam(self.newTeam);
        self.teams.push(self.newTeam);
    };
    
    var callback = function(data) {
        self.teams = data;
               console.log(self.teams);
    };
    //LocalStorageService.getAllTeams(callback);
}]);

skoutr.controller('TeamController', ['$stateParams', 'LocalStorageService', function($stateParams, LocalStorageService) {
   var self = this;
    this.teamName = "";
    this.teamNum = $stateParams.id;
    this.comments = [];
    
    
    this.newTeam = {
       teamNum: "",
       teamName: "",
       panels: []
    };
    
    this.addTeam = function() {
        LocalStorageService.addTeam(self.newTeam);
    };
    
    LocalStorageService.getTeam($stateParams.id, function(data) {
        console.log(data);
        self.teamName = data.name;
        self.teamNum = data.number;
    }, function(data) {
        self.comments = data;
    });
}]);

skoutr.controller('MatchController', ['$http', '$stateParams', 'CommentFactory', 'LocalStorageService', 'UserService', function($http, $stateParams, CommentFactory, LocalStorageService, UserService) {
    var self = this;
    this.newTag = "";
    this.matchID = $stateParams.id;
    this.matchData = {};
    this.newTag = "";
    this.comments = [];
    
    // LocalStorageService.getMatchComments(this.matchID, function(comments) {
    //     self.comments = comments;
    // });
        
    LocalStorageService.getMatchData(this.matchID, function(match) {
        self.matchData.redTeams = match.red.split(",").slice(1,4);
        self.matchData.blueTeams = match.blue.split(',').slice(1,4);
        self.matchData.time = match.time;
        self.matchData.name = match.name;
        self.matchData.teamNames = match.names;
        self.matchData.tags = match.tags.split(",").slice(1,-1);
        //console.log(self.matchData);
    });
    
    this.addTag = function() {
       LocalStorageService.addMatchTag(self.matchID, self.newTag);
       self.matchData.tags.push(self.newTag);
       self.newTag = "";
    };
    
    this.removeTag = function(oldTag) {
        LocalStorageService.removeMatchTag(self.matchID, oldTag);
        var index = self.matchData.tags.indexOf(oldTag);
        if (index != -1)
            self.matchData.tags.splice(index, 1);
    };
    
    this.newComment = {
        team: 0,
        match: $stateParams.id,
        category: "Shooting",
        rating: 8,
        text: "",
        author: UserService.getUserID(),
        date: new Date()
    };
    
    this.addComment = function() {
      LocalStorageService.addMatchComment(self.newComment.team, self.newComment);
       self.comments.push(self.newComment);
    }; 

    
    // $http.get('http://localhost:3000/' + 'match/' + $stateParams.id).then(function(response) {
    //    var data = response.data;
    //    self.tags = data.tags;
    //    self.name = data.name;
    //    self.date = data.date;
    //    self.redTeams = data.red;
    //    self.blueTeams = data.blue; 
    // });
}]);

skoutr.factory('SaveService', ['$http', 'OnlineFactory', function($http, OnlineFactory) {
    var self = this;
    var saveService = {};
    
    function isOnline() {
        return OnlineFactory.isOnline();
    }
    
    function save(url, data) {
    //    return $http.post("http://localhost:3000/" + url, data).then(function(data){}, function(error) {
    //        if (error) {
    //            alert(error.data.message);
    //        }
    //    });
    }
    
    function fetch(url, data) {
        return $http.get(url, data);
    }
    
    saveService.saveComment = function(matchID, comment) {
        return self.save('add/comment' + matchID, comment);
        /*
            $http.post('add/comment/' + self.matchID, self.newComment).then(function(response) {
            self.newComment.text = ""; 
            self.refreshComments();
            */ 
      };
    
    return saveService;
}]);

skoutr.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
   $urlRouterProvider.otherwise("/match/f1m1");
  
  $stateProvider
  .state('match', {
      url: "/match/:id",
      templateUrl: "partials/match.html",
      controller: "MatchController as match"
  }).state('home', {
      url: "/home",
      templateUrl: "partials/home.html"
  }).state('search', {
      url: "/search",
      templateUrl: "partials/search.html",
      controller: "SearchController as search"
  }).state('team', {
      url: "/team/:id",
      templateUrl: "partials/team.html",
      controller: "TeamController as team"
  }).state('admin', {
      url: "/admin",
      templateUrl: "partials/admin.html",
      controller: "AdminController as admin"
  });
});