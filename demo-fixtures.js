var ObjectId = require('mongoose').Types.ObjectId;

var users = {
  user1: { _id: new ObjectId(), email: 'user1@email.com' },
  user2: { _id: new ObjectId(), email: 'user2@email.com' }
}

var medias = [
  {
    creator: users.user2._id,
    likes: [],
    comments: []
  },
  {
    creator: users.user1._id,
    likes: [users.user1._id, users.user2._id],
    comments: [
      message: 'dummy message 1',
      creator: users.user2._id,
      likes: [users.user2._id],
    ]
  },
  {
    creator: users.user1._id,
    likes: [users.user2._id],
    comments: [
      {
        message: 'dummy message 1',
        creator: users.user2._id,
        likes: [users.user1._id, users.user2._id]
      },
      {
        message: 'dummy message 2',
        creator: users.user1._id,
        likes: [users.user2._id]
      }
    ]
  },
]

module.exports = {
  User: users,
  Media: medias,
}