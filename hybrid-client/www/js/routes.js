angular.module('starter')
.config(['$urlRouterProvider', '$stateProvider',
function($urlRouterProvider, $stateProvider) {
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.market', {
    url: '/market',
    views: {
      'tab-market': {
        templateUrl: 'market/main.html',
        controller: 'MarketCtrl',
        controllerAs: 'mkt'
      }
    }
  })

  .state('tab.monitor', {
    url: '/monitor',
    views: {
      'tab-monitor': {
        templateUrl: 'monitor/main.html',
        controller: 'MonitorCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  $urlRouterProvider.otherwise('/tab/market');

}]);
