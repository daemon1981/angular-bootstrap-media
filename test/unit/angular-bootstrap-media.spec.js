describe('angular.bootstrap.media', function () {
  var $scope, element;

  function createMockComment(id, message, likesCount, liked) {
    if (!likesCount) {
      likesCount = 0;
    }

    if (!liked) {
      liked = false;
    }

    return {
      _id:        id,
      message:    message,
      likesCount: likesCount,
      liked:      liked,
      creator:    {
        _id: 'user-id',
        name: 'Dummy Name',
        email: 'dummy@email.com'
      }
    };
  }

  function createMockMedia(id, text, likesCount, liked, comments) {
    if (!likesCount) {
      likesCount = 0;
    }

    if (!liked) {
      liked = false;
    }

    var media = {
      _id:        id,
      text:       text,
      likesCount: likesCount,
      liked:      liked,
      comments:   comments,
      creator:    {
        _id: 'user-id',
        name: 'Dummy Name',
        email: 'dummy@email.com'
      }
    };

    media.$id = function() { return media._id; };
    media.$getText = function() { return media.text; };

    return media;
  }

  var service = {
    formatLikersText: function(likesCount, nameList) {
      return nameList.split(',');
    },
    /**
     * Get creator profile link
     * @param {Media|Comment} object
     */
    getCreatorProfileLink: function(object) {
      return '/profile/' + object.creator._id;
    },
    /**
     * Get creator picture link
     * @param {Media|Comment} object
     */
    getCreatorPictureLink: function(object) {
      return '/users/' + object.creator._id + '/picture';
    },
    getUserPictureLink: function(){
      return '/users/current-user-id/picture';
    },
    editMedia: function(media) {
      // edit media
    },
    removeMedia: function(media) {
      // remove media
    },
    getDeleteLabel: function(){
      return 'Dummy delete label';
    }
  };

  beforeEach(module('vendor-templates'));
  beforeEach(module('angular.bootstrap.media.templates'));
  beforeEach(module('angular.bootstrap.media'));

  describe('media', function () {
    beforeEach(inject(function($rootScope, $compile) {
      $scope = $rootScope;
      $scope.service = service;
      var template = '<media ' +
        'media="media" ' +
        'service="service" ' +
        'max-last-comments="10">' +
        '</media>';
      element = $compile(template)($scope);
    }));

    it('create a media component', function() {
      $scope.media = createMockMedia('media-id', 'dummy text', 0, false, []);
      $scope.$digest();
      // check buttons presence
      expect(element.find('button').length).toBe(6);
      expect(element.find('button[ng-click="service.removeMedia(media)"]').length).toBe(1);
      expect(element.find('button[ng-click="like()"]').length).toBe(1);
      expect(element.find('button[ng-click="unlike()"]').length).toBe(1);
      expect(element.find('button[ng-click="focusMediaCommentArea($event)"]').length).toBe(1);
      expect(element.find('button[ng-click="service.editMedia(media)"]').length).toBe(1);
      expect(element.find('button[ng-click="displayPreviousComments()"]').length).toBe(1);
      // comment elements presence
      expect(element.find('.media.comment-editor').length).toBe(1);
      expect(element.find('.media.comment-editor .media-body').length).toBe(1);
      expect(element.find('.media.comment-editor form[ng-submit="comment()"]').length).toBe(1);
      expect(element.find('.media.comment-editor input[type="submit"]').length).toBe(1);
      // check image precence
      expect(element.find('img').length).toBe(2);
      expect(element.find('img:eq(0)').attr('src')).toBe('/users/user-id/picture');
      expect(element.find('img:eq(1)').attr('src')).toBe('/users/current-user-id/picture');
      // no comments
      expect(element.find('.media.comment').length).toBe(0);
      // no one like
      expect(element.find('.media-num-likes').text().trim()).toBe('0');
    });

    it('create a media component with one comment', function() {
      $scope.media = createMockMedia('media-id', 'dummy text', 0, false, [createMockComment('comment-id', 'dummy message')]);
      $scope.$digest();
      // check gravatars presence
      expect(element.find('img').length).toBe(3);
      expect(element.find('img:eq(0)').attr('src')).toBe('/users/user-id/picture');
      expect(element.find('img:eq(1)').attr('src')).toBe('/users/user-id/picture');
      expect(element.find('img:eq(2)').attr('src')).toBe('/users/current-user-id/picture');
      // no comments
      expect(element.find('.media.comment').length).toBe(1);
      // no one like
      expect(element.find('.media-num-likes').text().trim()).toBe('0');
    });
  
    it('display comments and count likes when existing', function() {
      $scope.media = createMockMedia(
        'media-id',
        'dummy text',
        2,
        false,
        [createMockComment('comment-id', 'dummy message')]
      );
      $scope.$digest();
      expect(element.find('.media.comment').length).toBe(1);
      expect(element.find('.media-num-likes').length).toBe(1);
      expect(element.find('.media-num-likes').text().trim()).toBe('2');
    });

    describe('like', function () {
      it('increment one like', function() {
        $scope.media = createMockMedia('media-id', 'dummy text', 0, false, []);
        $scope.media.$addLike = function(success) {
          success(createMockMedia('media-id', 'dummy text', 1, true, []));
        };
        $scope.$digest();

        expect(element.find('.media-num-likes').text().trim()).toBe('0');
        expect(element.find('button[ng-click="like()"]').hasClass('ng-hide')).toBe(false);
        expect(element.find('button[ng-click="unlike()"]').hasClass('ng-hide')).toBe(true);

        element.find('button[ng-click="like()"]').click();

        expect(element.find('.media-num-likes').text().trim()).toBe('1');
        expect(element.find('button[ng-click="like()"]').hasClass('ng-hide')).toBe(true);
        expect(element.find('button[ng-click="unlike()"]').hasClass('ng-hide')).toBe(false);
      });
    });

    describe('unlike', function () {
      it('unincrement one like', function() {
        $scope.media = createMockMedia('media-id', 'dummy text', 1, true, []);
        $scope.media.$removeLike = function(success) {
          success(createMockMedia('media-id', 'dummy text', 0, false, []));
        };
        $scope.$digest();

        expect(element.find('.media-num-likes').text().trim()).toBe('1');
        expect(element.find('button[ng-click="like()"]').hasClass('ng-hide')).toBe(true);
        expect(element.find('button[ng-click="unlike()"]').hasClass('ng-hide')).toBe(false);

        element.find('button[ng-click="unlike()"]').click();

        expect(element.find('.media-num-likes').text().trim()).toBe('0');
        expect(element.find('button[ng-click="like()"]').hasClass('ng-hide')).toBe(false);
        expect(element.find('button[ng-click="unlike()"]').hasClass('ng-hide')).toBe(true);
      });
    });

    describe('comment', function () {
      it('insert a comment', function() {
        $scope.media = createMockMedia('media-id', 'dummy text', 0, false, []);
        $scope.media.$addComment = function(message, success) {
          success(createMockMedia('media-id', 'dummy text', 0, false, [createMockComment('comment-id', message)]));
        };
        $scope.$digest();

        expect(element.find('.media.comment').length).toBe(0);

        element.find('.media.comment-editor input[name="message"]').val('dummy message');
        element.find('.media.comment-editor input[name="message"]').trigger('input');
        element.find('.media.comment-editor form[ng-submit="comment()"] input[type="submit"]').click();

        expect(element.find('.media.comment').length).toBe(1);
      });
    });

    describe('removeComment', function () {
      it('remove a comment', function() {
        var comment = createMockComment('comment-id', 'dummy message');
        $scope.media = createMockMedia('media-id', 'dummy text', 0, false, [comment]);
        $scope.media.$removeComment = function(commentId, success) {
          success(createMockMedia('media-id', 'dummy text', 0, false, []));
        };
        $scope.$digest();

        expect(element.find('.media.comment').length).toBe(1);
        expect(element.find('.media.comment button[ng-click="removeComment(comment)"]').length).toBe(1);

        element.find('.media.comment button[ng-click="removeComment(comment)"]').click();

        expect(element.find('.media.comment').length).toBe(0);
      });
    });

    describe('displayPreviousComments', function () {
      it('display previous comments before displayed comments', function() {
        var comment = createMockComment('comment-id-2', 'dummy message 2');
        $scope.media = createMockMedia('media-id', 'dummy text', 0, false, [comment]);
        $scope.media.$getPreviousComments = function(numComments, maxNumLast, success) {
          success({0: createMockComment('comment-id-1', 'dummy message 1')});
        };
        $scope.$digest();

        expect(element.find('.media.comment').length).toBe(1);

        expect(element.find('button[ng-click="displayPreviousComments()"]').length).toBe(1);
        element.find('button[ng-click="displayPreviousComments()"]').click();

        expect(element.find('.media.comment').length).toBe(2);
        expect(element.find('.media.comment:eq(0) .media-body').text()).toMatch(/dummy message 1/);
        expect(element.find('.media.comment:eq(1) .media-body').text()).toMatch(/dummy message 2/);
      });
    });
  });

  describe('comment', function () {
    beforeEach(inject(function($rootScope, $compile) {
      $scope = $rootScope;
      $scope.service = service;
      var template = '<comment ' +
        'media="media" ' +
        'service="service" ' +
        'comment="comment" ' +
        'on-comment-remove="removeComment(comment)" ' +
        'default-gravatar-image="monsterid">' +
        '</comment>';
      element = $compile(template)($scope);
    }));

    it('create a comment', function(){
      var comment = createMockComment('comment-id', 'dummy message');
      $scope.media = createMockMedia('media-id', 'dummy text', 0, false, [comment]);
      $scope.comment = comment;
      $scope.$digest();

      // check buttons presence
      expect(element.find('button').length).toBe(3);
      expect(element.find('button[ng-click="likeComment()"]').length).toBe(1);
      expect(element.find('button[ng-click="unlikeComment()"]').length).toBe(1);
      expect(element.find('button[ng-click="removeComment(comment)"]').length).toBe(1);
      // check gravatars presence
      expect(element.find('img').length).toBe(1);
      expect(element.find('img:eq(0)').attr('src')).toBe('/users/user-id/picture');
      // no one like
      expect(element.find('.comment-num-likes').length).toBe(1);
      expect(element.find('.comment-num-likes:eq(0)').text().trim()).toBe('0');
    });

    it('display count likes when existing', function() {
      var comment = createMockComment('comment-id', 'dummy message', 2, false);
      $scope.media = createMockMedia('media-id', 'dummy text', 0, false, [comment]);
      $scope.comment = comment;
      $scope.$digest();

      expect(element.find('.comment-num-likes').length).toBe(1);
      expect(element.find('.comment-num-likes').text().trim()).toBe('2');
    });

    describe('likeComment', function(){
      it('add like to the comment', function() {
        var comment = createMockComment('comment-id', 'dummy message');
        $scope.media = createMockMedia('media-id', 'dummy text', 0, false, [comment]);
        $scope.comment = comment;
        $scope.media.$addLikeToComment = function(commentId, success) {
          success();
        };
        $scope.media.$getComment = function(commentId, success) {
          success(createMockComment('comment-id', 'dummy message', 1, true));
        };
        $scope.$digest();

        expect(element.find('.comment-num-likes').length).toBe(1);
        expect(element.find('.comment-num-likes').text().trim()).toBe('0');
        expect(element.find('button[ng-click="likeComment()"]').length).toBe(1);
        expect(element.find('button[ng-click="likeComment()"]').hasClass('ng-hide')).toBe(false);
        expect(element.find('button[ng-click="unlikeComment()"]').hasClass('ng-hide')).toBe(true);

        element.find('button[ng-click="likeComment()"]').click();

        expect(element.find('.comment-num-likes').text().trim()).toBe('1');

        expect(element.find('button[ng-click="likeComment()"]').hasClass('ng-hide')).toBe(true);
        expect(element.find('button[ng-click="unlikeComment()"]').hasClass('ng-hide')).toBe(false);
      });
    });

    describe('unlikeComment', function(){
      it('unlike a comment', function() {
        var comment = createMockComment('comment-id', 'dummy message', 1, true);
        $scope.media = createMockMedia('media-id', 'dummy text', 0, false, [comment]);
        $scope.comment = comment;
        $scope.media.$removeLikeFromComment = function(commentId, success) {
          success();
        };
        $scope.media.$getComment = function(commentId, success) {
          success(createMockComment('comment-id', 'dummy message'));
        };
        $scope.$digest();

        expect(element.find('.comment-num-likes').length).toBe(1);
        expect(element.find('.comment-num-likes').text().trim()).toBe('1');
        expect(element.find('button[ng-click="likeComment()"]').hasClass('ng-hide')).toBe(true);
        expect(element.find('button[ng-click="unlikeComment()"]').hasClass('ng-hide')).toBe(false);

        expect(element.find('button[ng-click="unlikeComment()"]').length).toBe(1);
        element.find('button[ng-click="unlikeComment()"]').click();

        expect(element.find('.comment-num-likes').text().trim()).toBe('0');
        expect(element.find('button[ng-click="likeComment()"]').hasClass('ng-hide')).toBe(false);
        expect(element.find('button[ng-click="unlikeComment()"]').hasClass('ng-hide')).toBe(true);
      });
    });
  });
});
