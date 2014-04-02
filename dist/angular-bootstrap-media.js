/*! angular-bootstrap-media - v0.0.7 - 2014-04-02
 * Copyright (c) 2014 Damien Saillard <dam.saillard@gmail.com> (http://damien-saillard.fr/);
 * Licensed 
 */
angular.module('angular.bootstrap.media', ['angular.bootstrap.media.templates', 'angular.simple.gravatar'])

.controller('MediaController', ['$scope', function($scope){
  var updateSuccess = function(result) {
    $scope.media = result;
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

  $scope.ownMedia = function() {
    return $scope.media.creator === $scope.currentUser._id;
  };

  $scope.comment = function() {
    if ($scope.message) {
      $scope.media.$addComment(
        $scope.message,
        function success(result) {
          $scope.message = '';
          updateSuccess(result);
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
      currentUser: '=',
      media: '=',
      'deleteLabel': '@',
      'defaultGravatarImage': '@',
      'editMedia': '&onMediaEdit',
      'removeMedia': '&onMediaRemove'
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
        function error(result) {
          console.log(result);
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
    return $scope.comment.creator === $scope.currentUser._id;
  };
}])

.directive('comment', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      currentUser: '=',
      media: '=',
      comment: '=',
      'defaultGravatarImage': '@',
      'removeComment': '&onCommentRemove'
    },
    templateUrl: 'comment.tpl.html',
    controller: 'CommentController'
  };
});

angular.module('angular.bootstrap.media.templates', ['comment.tpl.html', 'media.tpl.html']);

angular.module("comment.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("comment.tpl.html",
    "<div class=\"media comment\">\n" +
    "    <a class=\"pull-left\" href=\"#\">\n" +
    "        <gravatar email=\"comment.creator.email\" size=\"30\" class=\"img-polaroid pull-right\" default-image=\"defaultGravatarImage\"></gravatar>\n" +
    "    </a>\n" +
    "    <div class=\"media-body\">\n" +
    "        {{comment.message}}\n" +
    "        <div>\n" +
    "            <span class=\"badge ng-binding comment-num-likes\">{{comment.likes.length}} <span class=\"glyphicon glyphicon-thumbs-up\"></span></span>\n" +
    "            <button type=\"button\" class=\"btn btn-link\" ng-show=\"!userInArray(comment.likes)\" ng-click=\"likeComment()\">Like</button>\n" +
    "            <button type=\"button\" class=\"btn btn-link\" ng-show=\"userInArray(comment.likes)\" ng-click=\"unlikeComment()\">Unlike</button>\n" +
    "            <button type=\"button\" class=\"btn btn-danger btn-xs\" ng-show=\"ownComment()\" ng-click=\"removeComment(comment)\">\n" +
    "                <span class=\"glyphicon glyphicon-remove\"></span>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("media.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("media.tpl.html",
    "<div class=\"media\">\n" +
    "    <a class=\"pull-left\" href=\"#\">\n" +
    "        <gravatar email=\"media.creator.email\" size=\"30\" class=\"img-polaroid pull-right\" default-image=\"defaultGravatarImage\"></gravatar>\n" +
    "    </a>\n" +
    "    <div class=\"media-body\">\n" +
    "        <div>{{media.text}}</div>\n" +
    "        <div>\n" +
    "            <button type=\"button\" class=\"btn btn-danger btn-xs\" ng-show=\"ownMedia()\" ng-click=\"removeMedia(media)\">{{deleteLabel}}</button>\n" +
    "            &nbsp;&nbsp;\n" +
    "            <span class=\"badge ng-binding media-num-likes\">{{media.likes.length}} <span class=\"glyphicon glyphicon-thumbs-up\"></span></span>\n" +
    "            <button type=\"button\" class=\"btn btn-link\" ng-show=\"!userInArray(media.likes)\" ng-click=\"like()\">Like</button>\n" +
    "            <button type=\"button\" class=\"btn btn-link\" ng-show=\"userInArray(media.likes)\" ng-click=\"unlike()\">Unlike</button>\n" +
    "            <button type=\"button\" class=\"btn btn-link\" ng-click=\"focusMediaCommentArea($event)\">Comment</button>\n" +
    "            <button type=\"button\" class=\"btn btn-default btn-xs\" ng-show=\"ownMedia()\" ng-click=\"editMedia(media)\">\n" +
    "                <span class=\"glyphicon glyphicon-pencil\"></span>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "        <div>\n" +
    "            <button type=\"button\" class=\"btn btn-link\" ng-click=\"displayPreviousComments()\">Voir les commentaires précédents</button>\n" +
    "        </div>\n" +
    "        <comment class=\"comment\" comment=\"comment\" media=\"media\" current-user=\"currentUser\" ng-repeat=\"comment in media.comments\" on-comment-remove=\"removeComment(comment)\" default-gravatar-image=\"{{defaultGravatarImage}}\"></comment>\n" +
    "        <div class=\"media comment-editor\">\n" +
    "            <a class=\"pull-left\" href=\"#\">\n" +
    "                <gravatar email=\"currentUser.email\" size=\"30\" class=\"img-polaroid pull-right\" default-image=\"defaultGravatarImage\"></gravatar>\n" +
    "            </a>\n" +
    "            <div class=\"media-body\">\n" +
    "                <form ng-submit=\"comment()\">\n" +
    "                    <div class=\"input-group col-lg-6\">\n" +
    "                        <input class=\"form-control\" type=\"text\" name=\"message\" ng-model=\"message\">\n" +
    "                        <span class=\"input-group-btn\">\n" +
    "                            <input type=\"submit\" class=\"btn btn-primary\" value=\"Commenter\">\n" +
    "                        </span>\n" +
    "                    </div>\n" +
    "                </form>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);
