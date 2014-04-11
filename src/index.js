angular.module('angular.bootstrap.media', [
  'angular.bootstrap.media.templates',
  'angular.simple.gravatar',
  'ngSanitize',
  'pascalprecht.translate'
])

.config(['$translateProvider', function($translateProvider){
  $translateProvider.translations('en', {
    'CREATOR_URL': '/users/{{id}}',
    'LIKERS_TEXT': '{{likersText}} {othersCount, plural, zero{} one{and one other person} other{and # others}}.'
  });
  $translateProvider.useMessageFormatInterpolation();
  $translateProvider.preferredLanguage('en');
}])

.controller('MediaController', ['$scope', '$translate', function($scope, $translate){
  $scope.likersLoaded = false;
  $scope.likersText = 'Chargement...';

  $scope.creatorLink = $translate.instant('CREATOR_URL', { id: $scope.media.creator._id });

  var updateSuccess = function(mediaUpdated) {
    $scope.media = mediaUpdated;
  };

  var failsRequest = function() {
    console.log('error');
  };

  $scope.focusMediaCommentArea = function($event) {
    $($event.currentTarget).closest('.media-body').find('.form-control').focus();
  };

  $scope.like = function() {
    $scope.media.$addLike(updateSuccess, failsRequest);
  };

  $scope.unlike = function() {
    $scope.media.$removeLike(updateSuccess, failsRequest);
  };

  $scope.getLikers = function() {
    if ($scope.likersLoaded === true) {
      return $scope.likersText;
    }

    $scope.media.$getLikers(
      function(likers) {
        $scope.likersText = $translate.instant(
          'LIKERS_TEXT',
          {
            likersText: likers.join('<br>'),
            othersCount: $scope.media.likesCount - likers.length
          }
        );
      },
      failsRequest
    );
  };

  $scope.comment = function() {
    if ($scope.message) {
      $scope.media.$addComment(
        $scope.message,
        function success(mediaUpdated) {
          $scope.message = '';
          updateSuccess(mediaUpdated);
        },
        failsRequest
      );
    }
  };

  $scope.removeComment = function(comment) {
    $scope.media.$removeComment(comment._id, updateSuccess, failsRequest);
  };

  $scope.displayPreviousComments = function() {
    $scope.media.$getPreviousComments(
      $scope.media.comments.length,
      10,
      function successRequest(lastComments) {
        for (var i = Object.keys(lastComments).length - 1; i >= 0; i--) {
          $scope.media.comments.unshift(lastComments[i]);
        }
      },
      failsRequest
    );
  };
}])

.directive('media', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      media:                  '=',
      maxLastComments:        '=',
      'deleteLabel':          '@',
      'defaultGravatarImage': '@',
      'editMedia':            '&onMediaEdit',
      'removeMedia':          '&onMediaRemove'
    },
    templateUrl: 'media.tpl.html',
    controller: 'MediaController'
  };
})

.controller('CommentController', ['$scope', '$translate', function($scope, $translate){
  $scope.likersLoaded = false;
  $scope.likersText = 'Chargement...';

  $scope.creatorLink = $translate.instant('CREATOR_URL', { id: $scope.comment.creator._id });

  var updateSuccess = function(commentId) {
    return function() {
      $scope.media.$getComment(
        commentId,
        function success(comment) {
          $scope.comment = comment;
        },
        function error(message) {
          console.log(message);
        }
      );
    };
  };

  var failsRequest = function() {
    console.log('error');
  };

  $scope.likeComment = function() {
    $scope.media.$addLikeToComment($scope.comment._id, updateSuccess($scope.comment._id), failsRequest);
  };

  $scope.unlikeComment = function() {
    $scope.media.$removeLikeFromComment($scope.comment._id, updateSuccess($scope.comment._id), failsRequest);
  };

  $scope.getLikers = function() {
    if ($scope.likersLoaded === true) {
      return $scope.likersText;
    }

    $scope.media.$getCommentLikers(
      $scope.comment._id,
      function(likers) {
        $scope.likersText = $translate.instant(
          'LIKERS_TEXT',
          {
            likersText: likers.join('<br>'),
            othersCount: $scope.comment.likesCount - likers.length
          }
        );
        $scope.likersLoaded = true;
      },
      failsRequest
    );
  };
}])

.directive('comment', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      media:                  '=',
      comment:                '=',
      'defaultGravatarImage': '@',
      'removeComment':        '&onCommentRemove'
    },
    templateUrl: 'comment.tpl.html',
    controller: 'CommentController'
  };
});
