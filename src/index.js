angular.module('angular.bootstrap.media', ['angular.bootstrap.media.templates', 'angular.simple.gravatar', 'ngSanitize'])

.controller('MediaController', ['$scope', function($scope){
  $scope.media.likers = 'Chargement...';

  var updateSuccess = function(mediaUpdated) {
    $scope.media = mediaUpdated;
  };

  var failsRequest = function() {
    console.log('error');
  };

  $scope.focusMediaCommentArea = function($event) {
    $($event.currentTarget).closest('.media-body').find('.form-control').focus();
  };

  $scope.userInArray = function(userIds) {
    return userIds.indexOf($scope.currentUser._id) !== -1;
  };

  $scope.like = function() {
    $scope.media.$addLike(updateSuccess, failsRequest);
  };

  $scope.unlike = function() {
    $scope.media.$removeLike(updateSuccess, failsRequest);
  };

  $scope.getLikers = function() {
    if (typeof $scope.media.likers !== 'string') {
      return $scope.media.likers;
    }

    $scope.media.$getLikers(
      function(likers) {
        $scope.media.likers = likers.join('<br>');
      },
      failsRequest
    );
  };

  $scope.ownMedia = function() {
    return $scope.media.creator._id === $scope.currentUser._id;
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
      currentUser:            '=',
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

.controller('CommentController', ['$scope', function($scope){
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

  var updateError = function() {
    console.log('error');
  };

  $scope.userInArray = function(userIds) {
    if (userIds) {
      return userIds.indexOf($scope.currentUser._id) !== -1;
    }
  };

  $scope.likeComment = function() {
    $scope.media.$addLikeToComment($scope.comment._id, updateSuccess($scope.comment._id), updateError);
  };

  $scope.unlikeComment = function() {
    $scope.media.$removeLikeFromComment($scope.comment._id, updateSuccess($scope.comment._id), updateError);
  };

  $scope.ownComment = function() {
    return $scope.comment.creator._id === $scope.currentUser._id;
  };
}])

.directive('comment', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      currentUser:            '=',
      media:                  '=',
      comment:                '=',
      'defaultGravatarImage': '@',
      'removeComment':        '&onCommentRemove'
    },
    templateUrl: 'comment.tpl.html',
    controller: 'CommentController'
  };
});
