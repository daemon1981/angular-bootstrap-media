/*! angular-bootstrap-media - v0.0.10 - 2014-04-17
 * Copyright (c) 2014 Damien Saillard <dam.saillard@gmail.com> (http://damien-saillard.fr/);
 * Licensed 
 */
angular.module('angular.bootstrap.media', [
  'angular.bootstrap.media.templates',
  'ui.bootstrap.tooltip'
])

.controller('MediaController', ['$scope', function($scope){
  $scope.likersLoaded = false;
  $scope.likersText = 'Chargement...';

  $scope.creatorProfileLink = $scope.service.getCreatorProfileLink($scope.media);
  $scope.creatorPictureLink = $scope.service.getCreatorPictureLink($scope.media);
  $scope.deleteLabel        = $scope.service.getDeleteLabel();

  $scope.getText = function(){
    return $scope.media.$getText();
  };

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
      function(nameList) {
        $scope.likersText = $scope.service.formatLikersText($scope.media.likesCount, nameList);
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
      service:                '=',
      maxLastComments:        '='
    },
    templateUrl: 'media.tpl.html',
    controller: 'MediaController'
  };
})

.controller('CommentController', ['$scope', function($scope){
  $scope.likersLoaded = false;
  $scope.likersText = 'Chargement...';

  $scope.creatorProfileLink = $scope.service.getCreatorProfileLink($scope.comment);
  $scope.creatorPictureLink = $scope.service.getCreatorPictureLink($scope.comment);

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
      function(nameList) {
        $scope.likersText = $scope.service.formatLikersText($scope.comment.likesCount, nameList);
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
      service:                '=',
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
    "        <img ng-src=\"{{creatorPictureLink}}\" width=\"30\" class=\"img-polaroid pull-right\">" +
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
    "        <img ng-src=\"{{creatorPictureLink}}\" width=\"30\" class=\"img-polaroid pull-right\">" +
    "    </a>" +
    "    <div class=\"media-body\">" +
    "        <a class=\"creator\" href=\"{{creatorLink}}\">{{media.creator.name}}</a>" +
    "        <div>{{getText()}}</div>" +
    "        <div>" +
    "            <button type=\"button\" class=\"btn btn-danger btn-xs\" ng-show=\"media.editable\" ng-click=\"service.removeMedia(media)\">{{deleteLabel}}</button>" +
    "            &nbsp;&nbsp;" +
    "            <span class=\"badge ng-binding media-num-likes\" tooltip-html-unsafe=\"{{likersText}}\" tooltip-placement=\"bottom\" ng-mouseover=\"getLikers()\">{{media.likesCount}} <span class=\"glyphicon glyphicon-thumbs-up\"></span></span>" +
    "            <button type=\"button\" class=\"btn btn-link\" ng-show=\"!media.liked\" ng-click=\"like()\">Like</button>" +
    "            <button type=\"button\" class=\"btn btn-link\" ng-show=\"media.liked\" ng-click=\"unlike()\">Unlike</button>" +
    "            <button type=\"button\" class=\"btn btn-link\" ng-click=\"focusMediaCommentArea($event)\">Comment</button>" +
    "            <button type=\"button\" class=\"btn btn-default btn-xs\" ng-show=\"media.editable\" ng-click=\"service.editMedia(media)\">" +
    "                <span class=\"glyphicon glyphicon-pencil\"></span>" +
    "            </button>" +
    "        </div>" +
    "        <div>" +
    "            <button type=\"button\" class=\"btn btn-link\" ng-click=\"displayPreviousComments()\">Voir les commentaires précédents</button>" +
    "        </div>" +
    "        <comment" +
    "            class=\"comment\"" +
    "            media=\"media\"" +
    "            comment=\"comment\"" +
    "            service=\"service\"" +
    "            ng-repeat=\"comment in media.comments\"" +
    "            on-comment-remove=\"removeComment(comment)\"" +
    "            default-gravatar-image=\"{{defaultGravatarImage}}\">" +
    "        </comment>" +
    "        <div class=\"media comment-editor\">" +
    "            <a class=\"pull-left\" href=\"#\">" +
    "                <img ng-src=\"{{service.getUserPictureLink()}}\" width=\"30\" class=\"img-polaroid pull-right\">" +
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
