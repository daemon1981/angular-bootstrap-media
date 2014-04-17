/*! angular-bootstrap-media - v0.0.10 - 2014-04-16
 * Copyright (c) 2014 Damien Saillard <dam.saillard@gmail.com> (http://damien-saillard.fr/);
 * Licensed 
 */
angular.module('angular.bootstrap.media', [
  'angular.bootstrap.media.templates',
  'angular.simple.gravatar',
  'ngSanitize'
])

.controller('MediaController', ['$scope', function($scope){
  $scope.likersLoaded = false;
  $scope.likersText = 'Chargement...';

  $scope.creatorLink = $scope.media.$getCreatorLink($scope.media.creator._id);

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
        $scope.likersText = $scope.media.$formatLikersText(likers);
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

.controller('CommentController', ['$scope', function($scope){
  $scope.likersLoaded = false;
  $scope.likersText = 'Chargement...';

  $scope.creatorLink = $scope.media.$getCreatorLink($scope.comment.creator._id);

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
        $scope.likersText = $scope.media.$formatLikersText(likers);
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

angular.module('angular.bootstrap.media.templates', ['comment.tpl.html', 'media.tpl.html']);

angular.module("comment.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("comment.tpl.html",
    "<div class=\"media comment\">" +
    "    <a class=\"pull-left\" href=\"#\">" +
    "        <gravatar email=\"comment.creator.email\" size=\"30\" class=\"img-polaroid pull-right\" default-image=\"defaultGravatarImage\"></gravatar>" +
    "    </a>" +
    "    <div class=\"media-body\">" +
    "        <a class=\"creator\" href=\"{{creatorLink}}\">{{comment.creator.name}}</a> {{comment.message}}" +
    "        <div>" +
    "            <span>{{ comment.dateCreation | date:'medium' }}</span>" +
    "            <span class=\"badge ng-binding comment-num-likes\" tooltip-html-unsafe=\"{{likersText}}\" tooltip-placement=\"bottom\" ng-mouseover=\"getLikers()\">{{comment.likesCount}} <span class=\"glyphicon glyphicon-thumbs-up\"></span></span>" +
    "            <button type=\"button\" class=\"btn btn-link\" ng-show=\"!comment.liked\" ng-click=\"likeComment()\">Like</button>" +
    "            <button type=\"button\" class=\"btn btn-link\" ng-show=\"comment.liked\" ng-click=\"unlikeComment()\">Unlike</button>" +
    "            <button type=\"button\" class=\"btn btn-danger btn-xs\" ng-show=\"comment.editable\" ng-click=\"removeComment(comment)\">" +
    "                <span class=\"glyphicon glyphicon-remove\"></span>" +
    "            </button>" +
    "        </div>" +
    "    </div>" +
    "</div>");
}]);

angular.module("media.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("media.tpl.html",
    "<div class=\"media\">" +
    "    <a class=\"pull-left\" href=\"#\">" +
    "        <gravatar email=\"media.creator.email\" size=\"30\" class=\"img-polaroid pull-right\" default-image=\"defaultGravatarImage\"></gravatar>" +
    "    </a>" +
    "    <div class=\"media-body\">" +
    "        <a class=\"creator\" href=\"{{creatorLink}}\">{{media.creator.name}}</a>" +
    "        <div ng-bind-html=\"media.text\"></div>" +
    "        <div>" +
    "            <button type=\"button\" class=\"btn btn-danger btn-xs\" ng-show=\"media.editable\" ng-click=\"removeMedia(media)\">{{deleteLabel}}</button>" +
    "            &nbsp;&nbsp;" +
    "            <span class=\"badge ng-binding media-num-likes\" tooltip-html-unsafe=\"{{likersText}}\" tooltip-placement=\"bottom\" ng-mouseover=\"getLikers()\">{{media.likesCount}} <span class=\"glyphicon glyphicon-thumbs-up\"></span></span>" +
    "            <button type=\"button\" class=\"btn btn-link\" ng-show=\"!media.liked\" ng-click=\"like()\">Like</button>" +
    "            <button type=\"button\" class=\"btn btn-link\" ng-show=\"media.liked\" ng-click=\"unlike()\">Unlike</button>" +
    "            <button type=\"button\" class=\"btn btn-link\" ng-click=\"focusMediaCommentArea($event)\">Comment</button>" +
    "            <button type=\"button\" class=\"btn btn-default btn-xs\" ng-show=\"media.editable\" ng-click=\"editMedia(media)\">" +
    "                <span class=\"glyphicon glyphicon-pencil\"></span>" +
    "            </button>" +
    "        </div>" +
    "        <div>" +
    "            <button type=\"button\" class=\"btn btn-link\" ng-click=\"displayPreviousComments()\">Voir les commentaires précédents</button>" +
    "        </div>" +
    "        <comment class=\"comment\" comment=\"comment\" media=\"media\" ng-repeat=\"comment in media.comments\" on-comment-remove=\"removeComment(comment)\" default-gravatar-image=\"{{defaultGravatarImage}}\"></comment>" +
    "        <div class=\"media comment-editor\">" +
    "            <a class=\"pull-left\" href=\"#\">" +
    "                <gravatar email=\"currentUser.email\" size=\"30\" class=\"img-polaroid pull-right\" default-image=\"defaultGravatarImage\"></gravatar>" +
    "            </a>" +
    "            <div class=\"media-body\">" +
    "                <form ng-submit=\"comment()\">" +
    "                    <div class=\"input-group col-lg-6\">" +
    "                        <input class=\"form-control\" type=\"text\" name=\"message\" ng-model=\"message\">" +
    "                        <span class=\"input-group-btn\">" +
    "                            <input type=\"submit\" class=\"btn btn-primary\" value=\"Commenter\">" +
    "                        </span>" +
    "                    </div>" +
    "                </form>" +
    "            </div>" +
    "        </div>" +
    "    </div>" +
    "</div>");
}]);
