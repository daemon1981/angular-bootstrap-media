describe('angular.bootstrap.media', function () {
  var $scope, element;

  function createMockComment(id, message, likes, creatorId) {
    return {
      _id: id,
      message: message,
      likes: likes,
      creator: {
        _id: creatorId
      }
    };
  }

  function createMockMedia(id, text, likes, comments, creatorId) {
    var media = {
      _id: id,
      text: text,
      likes: likes,
      comments: comments,
      creator: {
        _id: creatorId
      }
    };

    media.$id = function() { return media._id; };

    return media;
  }

  beforeEach(module('angular.bootstrap.media.templates'));
  beforeEach(module('angular.bootstrap.media'));

  describe('media', function () {
    beforeEach(inject(function($rootScope, $compile) {
      $scope = $rootScope;
      $scope.currentUser = { _id: 'user-id' };
      var template = '<media ' +
        'media="media" ' +
        'maxLastComments="10" ' +
        'current-user="currentUser" ' +
        'delete-label="Supprimer le media" ' +
        'default-gravatar-image="monsterid">' +
        '</media>';
      element = $compile(template)($scope);
    }));

    it('create a media component', function() {
      $scope.media = createMockMedia('media-id', 'dummy text', [], [], 'test@eleven-labs.com');
      $scope.$digest();
      // check buttons presence
      expect(element.find('button').length).toBe(6);
      expect(element.find('button[ng-click="removeMedia(media)"]').length).toBe(1);
      expect(element.find('button[ng-click="like()"]').length).toBe(1);
      expect(element.find('button[ng-click="unlike()"]').length).toBe(1);
      expect(element.find('button[ng-click="focusMediaCommentArea($event)"]').length).toBe(1);
      expect(element.find('button[ng-click="editMedia(media)"]').length).toBe(1);
      expect(element.find('button[ng-click="displayPreviousComments()"]').length).toBe(1);
      // comment elements presences
      expect(element.find('.media.comment-editor').length).toBe(1);
      expect(element.find('.media.comment-editor .media-body').length).toBe(1);
      expect(element.find('.media.comment-editor form[ng-submit="comment()"]').length).toBe(1);
      expect(element.find('.media.comment-editor input[type="submit"]').length).toBe(1);
      // check gravatars presence
      expect(element.find('img').length).toBe(2);
      expect(element.find('img:eq(0)').attr('ng-src')).toBe('http://www.gravatar.com/avatar/?s=30&d=monsterid');
      expect(element.find('img:eq(1)').attr('ng-src')).toBe('http://www.gravatar.com/avatar/?s=30&d=monsterid');
      // no comments
      expect(element.find('.media.comment').length).toBe(0);
      // no one like
      expect(element.find('.media-num-likes').text().trim()).toBe('0');
    });

    it('create a media component with one comment', function() {
      $scope.media = createMockMedia('media-id', 'dummy text', [], [createMockComment('comment-id', 'dummy message')]);
      $scope.$digest();
      // check gravatars presence
      expect(element.find('img').length).toBe(3);
      expect(element.find('img:eq(0)').attr('ng-src')).toBe('http://www.gravatar.com/avatar/?s=30&d=monsterid');
      expect(element.find('img:eq(1)').attr('ng-src')).toBe('http://www.gravatar.com/avatar/?s=30&d=monsterid');
      expect(element.find('img:eq(2)').attr('ng-src')).toBe('http://www.gravatar.com/avatar/?s=30&d=monsterid');
      // no comments
      expect(element.find('.media.comment').length).toBe(1);
      // no one like
      expect(element.find('.media-num-likes').text().trim()).toBe('0');
    });
  
    it('display comments and count likes when existing', function() {
      $scope.media = createMockMedia(
        'media-id',
        'dummy text',
        ['user-dummy-id-1', 'user-dummy-id-2'],
        [createMockComment('comment-id', 'dummy message', [])]
      );
      $scope.$digest();
      expect(element.find('.media.comment').length).toBe(1);
      expect(element.find('.media-num-likes').length).toBe(1);
      expect(element.find('.media-num-likes').text().trim()).toBe('2');
    });

    describe('like', function () {
      it('increment one like', function() {
        $scope.media = createMockMedia('media-id', 'dummy text', [], []);
        $scope.media.$addLike = function(success) {
          success(createMockMedia('media-id', 'dummy text', ['user-id'], []));
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
        $scope.media = createMockMedia('media-id', 'dummy text', ['user-id'], []);
        $scope.media.$removeLike = function(success) {
          success(createMockMedia('media-id', 'dummy text', [], []));
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
        $scope.media = createMockMedia('media-id', 'dummy text', [], []);
        $scope.media.$addComment = function(message, success) {
          success(createMockMedia('media-id', 'dummy text', [], [createMockComment('comment-id', message, [])]));
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
        var comment = createMockComment('comment-id', 'dummy message', []);
        $scope.media = createMockMedia('media-id', 'dummy text', [], [comment]);
        $scope.media.$removeComment = function(commentId, success) {
          success(createMockMedia('media-id', 'dummy text', [], []));
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
        var comment = createMockComment('comment-id-2', 'dummy message 2', []);
        $scope.media = createMockMedia('media-id', 'dummy text', [], [comment]);
        $scope.media.$getPreviousComments = function(numComments, maxNumLast, success) {
          success({0: createMockComment('comment-id-1', 'dummy message 1', [])});
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

    describe('ownMedia', function () {
      it('display edit and remove button when user owns the media', function() {
        $scope.media = createMockMedia('media-id', 'dummy text', [], [], 'user-id');
        $scope.$digest();

        expect(element.find('button[ng-click="removeMedia(media)"]').hasClass('ng-hide')).toBe(false);
        expect(element.find('button[ng-click="editMedia(media)"]').hasClass('ng-hide')).toBe(false);
      });
      it('hide edit and remove button when user doesn\'t own the media', function() {
        $scope.media = createMockMedia('media-id', 'dummy text', [], [], 'other-user-id');
        $scope.$digest();

        expect(element.find('button[ng-click="removeMedia(media)"]').hasClass('ng-hide')).toBe(true);
        expect(element.find('button[ng-click="editMedia(media)"]').hasClass('ng-hide')).toBe(true);
      });
    });
  });

  describe('comment', function () {
    beforeEach(inject(function($rootScope, $compile) {
      $scope = $rootScope;
      $scope.currentUser = { _id: 'user-id' };
      element = $compile('<comment comment="comment" current-user="currentUser" media="media" on-comment-remove="removeComment(comment)" default-gravatar-image="monsterid"></comment>')($scope);
    }));

    it('create a comment', function(){
      var comment = createMockComment('comment-id', 'dummy message', []);
      $scope.media = createMockMedia('media-id', 'dummy text', [], [comment]);
      $scope.comment = comment;
      $scope.$digest();

      // check buttons presence
      expect(element.find('button').length).toBe(3);
      expect(element.find('button[ng-click="likeComment()"]').length).toBe(1);
      expect(element.find('button[ng-click="unlikeComment()"]').length).toBe(1);
      expect(element.find('button[ng-click="removeComment(comment)"]').length).toBe(1);
      // check gravatars presence
      expect(element.find('img').length).toBe(1);
      expect(element.find('img:eq(0)').attr('ng-src')).toBe('http://www.gravatar.com/avatar/?s=30&d=monsterid');
      // no one like
      expect(element.find('.comment-num-likes').length).toBe(1);
      expect(element.find('.comment-num-likes:eq(0)').text().trim()).toBe('0');
    });

    it('display count likes when existing', function() {
      var comment = createMockComment('comment-id', 'dummy message', ['user-dummy-id-1', 'user-dummy-id-2']);
      $scope.media = createMockMedia('media-id', 'dummy text', [], [comment]);
      $scope.comment = comment;
      $scope.$digest();

      expect(element.find('.comment-num-likes').length).toBe(1);
      expect(element.find('.comment-num-likes').text().trim()).toBe('2');
    });

    describe('likeComment', function(){
      it('add like to the comment', function() {
        var comment = createMockComment('comment-id', 'dummy message', []);
        $scope.media = createMockMedia('media-id', 'dummy text', [], [comment]);
        $scope.comment = comment;
        $scope.media.$addLikeToComment = function(commentId, success) {
          success();
        };
        $scope.media.$getComment = function(commentId, success) {
          success(createMockComment('comment-id', 'dummy message', ['user-id']));
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
        var comment = createMockComment('comment-id', 'dummy message', ['user-id']);
        $scope.media = createMockMedia('media-id', 'dummy text', [], [comment]);
        $scope.comment = comment;
        $scope.media.$removeLikeFromComment = function(commentId, success) {
          success();
        };
        $scope.media.$getComment = function(commentId, success) {
          success(createMockComment('comment-id', 'dummy message', []));
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

    describe('ownComment', function () {
      it('display remove button when user owns the comment', function() {
        var comment = createMockComment('comment-id', 'dummy message', [], 'user-id');
        $scope.media = createMockMedia('media-id', 'dummy text', [], [comment]);
        $scope.comment = comment;
        $scope.$digest();

        expect(element.find('button[ng-click="removeComment(comment)"]').hasClass('ng-hide')).toBe(false);
      });
      it('hide remove button when user doesn\'t own the comment', function() {
        var comment = createMockComment('comment-id', 'dummy message', [], 'other-user-id');
        $scope.media = createMockMedia('media-id', 'dummy text', [], [comment]);
        $scope.comment = comment;
        $scope.$digest();

        expect(element.find('button[ng-click="removeComment(comment)"]').hasClass('ng-hide')).toBe(true);
      });
    });
  });
});
