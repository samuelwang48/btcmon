angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('MarketCtrl', [
'$scope', '$rootScope', '$http', 'global', '$ionicActionSheet',
function($scope, $rootScope, $http, global, $ionicActionSheet){
  var ctrl = this;
  var socket = io(global.api);
  ctrl.updated = 0;
  ctrl.current_asset = 'BTC';
  ctrl.isStreaming = true;
  ctrl.exchanges = {};

  ctrl.setUpdated = function() { ctrl.updated++; };
  ctrl.getUpdated = function() { return ctrl.updated; };

  ctrl.switchStreaming = function() {
    ctrl.isStreaming = !ctrl.isStreaming;
    return ctrl.isStreaming;
  };

  var prepare_list = function(data, eachCb) {
    eachCb = eachCb || function() {};
    var resources = [];
    for (var ex in data) {
      var exchange = data[ex];
      exchange.name = ex;
      resources.push(exchange);
      eachCb(ex);
    }
    resources.pop();
    resources = _.orderBy(resources, ['volume_percent'], ['desc']);
    console.log(resources[0]);
    ctrl.resources = resources;
    ctrl.setUpdated();
    $rootScope.$applyAsync();
  };

  $http
    .get(global.api + '/market/list')
    .then(function(response){
      ctrl.test = response.data;
      prepare_list(response.data, function(ex) {
        //console.log(ex);
        $http
          .get(global.api + '/exchange/' + ex)
          .then(function(response) {
            if (response.data) {
              ctrl.exchanges[ex] = response.data;
              console.log(4, ex, ctrl.exchanges[ex]);
              //$rootScope.$applyAsync();
            }
          });
      });
    });

  var socket = new io.connect(global.api, {
      'reconnection': true,
      'reconnectionDelay': 5000,
      'reconnectionDelayMax' : 10000,
      'reconnectionAttempts': 5
  });
  var marketCb = function (response) {
    console.log('streaming', ctrl.isStreaming)
    if (ctrl.isStreaming) {
      prepare_list(response.payload);
    }
  };
  console.log('streaming', ctrl.isStreaming)
  socket.on('market', marketCb);
  socket.emit('start_feeding');

  ctrl.ceil = function(number) {
    var formatted = Math.ceil(parseFloat(number)*100)/100;
    return formatted ? '$' + formatted : 0;
  };

  ctrl.fixnum = function(number) {
    var formatted = number.toFixed(2);
    formatted = formatted.toString().split('.');
    return formatted;
  };

  ctrl.actions = function(name) {
    $ionicActionSheet.show({
      buttons: [
        { text: 'Bind Key/Secret Pair' }
      ],
      _destructiveText: 'Delete',
      titleText: name,
      cancelText: 'Cancel',
      cancel: function() {
        // add cancel code..
      },
      buttonClicked: function(index) {
        return true;
      }
    });
  }; 

  ctrl.refresh = function() {
    setTimeout(function(){
      $scope.$broadcast('scroll.refreshComplete');
    }, 2000);
  };

}]);
