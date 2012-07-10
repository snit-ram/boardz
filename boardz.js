Boards = new Meteor.Collection("boards");

if (Meteor.is_client) {

    Template.menu.page_is = function(page) {
        console.log(Session.get('page'), page);
        return Session.get('page') == page;
    };

    Template.home.boards = function() {
        var boards = Boards.find({});
        boards.count();
        return boards;
    };

    Session.set('page', 'home');

    Meteor.startup(function() {
        Router({
            '/': function() {
                Session.set('page', 'home');
            },

            '/about': function() {
                Session.set('page', 'about');
            },

            '/new-board': function() {
                $("#create-board-form").slideDown('slow');
            },

            '/boards/:name': function(name) {
                Session.set('page', 'boards');
            },
        }).init();

        Meteor.autosubscribe(function () {
            var page = Session.get('page');
            $('#container').html(Template[page]());
        });
    });
}

if (Meteor.is_server) {
    Meteor.startup(function () {});
}