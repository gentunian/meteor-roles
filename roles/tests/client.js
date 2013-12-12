;(function () {

  "use strict";

  var users,
      roles = ['admin','editor','user']

  users = {
    'eve': {
      _id: 'eve',
      roles: ['admin', 'editor']
    },
    'bob': {
      _id: 'bob',
      roles: {
        'group1': ['user'],
        'group2': ['editor']
      }
    },
    'joe': {
      _id: 'joe',
      roles: {
        '__roles_global__': ['admin'],
        'group1': ['editor']
      }
    }
  }

  function testUser (test, username, expectedRoles, group) {
    var user = users[username]

    // test using user object rather than userId to avoid mocking
    _.each(roles, function (role) {
      var expected = _.contains(expectedRoles, role),
          msg = username + ' expected to have \'' + role + '\' permission but does not',
          nmsg = username + ' had un-expected permission ' + role

      if (expected) {
        test.isTrue(Roles.userIsInRole(user, role, group), msg)
      } else {
        test.isFalse(Roles.userIsInRole(user, role, group), nmsg)
      }
    })
  }


  // Mock Meteor.user() for isInRole handlebars helper testing
  Meteor.user = function () {
    return {
      _id: 'testId',
      roles: ['user','manage-users']
    }
  }

  Tinytest.add(
    'roles - can check current users roles via template helper', 
    function (test) {
      var isInRole = Roles._handlebarsHelpers.isInRole,
          expected,
          actual

      test.equal(typeof isInRole, 'function', "'isInRole' helper not registered")

      expected = true
      actual = isInRole('admin, manage-users')
      test.equal(actual, expected)
      
      expected = false
      actual = isInRole('admin')
      test.equal(actual, expected)
    })

  Tinytest.add(
    'roles - can check if user is in role', 
    function (test) {
      testUser(test, 'eve', ['admin', 'editor'])
    })

  Tinytest.add(
    'roles - can check if user is in role by group', 
    function (test) {
      testUser(test, 'bob', ['user'], 'group1')
      testUser(test, 'bob', ['editor'], 'group2')
    })

  Tinytest.add(
    'roles - can check if user is in role with Roles.GLOBAL_GROUP', 
    function (test) {
      testUser(test, 'joe', ['admin'])
      testUser(test, 'joe', ['admin'], Roles.GLOBAL_GROUP)
      testUser(test, 'joe', ['admin', 'editor'], 'group1')
    })
}());
