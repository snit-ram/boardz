Boards = new Meteor.Collection("boards");

function randomString() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 32;
    var randomstring = '';
    for (var i=0; i<string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
    }
    return randomstring;
}

function slug(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
    var to   = "aaaaaeeeeeiiiiooooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
};

if (Meteor.is_client) {

    Template.main.content = function() {
        return Template[Session.get('page')]();
    };

    Template.menu.page_is = function(page) {
        return Session.equals('page', page);
    };

    Template.home.boards = function() {
        var boards = Boards.find({}, {sort: {title: 1}}).fetch();
        return boards;
    };

    Template.boards.board = function() {
        var name = Session.get('board-name');

        return Boards.findOne({name: name}) || {};
    };

    Template.home.events = {
        'click .add-board': function() {
            $("#create-board-form").slideDown('slow');
            $('.create-board-form .board-title').focus();
        },

        'click .create-board-form .close': function() {
            $("#create-board-form").slideUp('slow');
        },

        'submit .create-board-form': function(event) {
            event.preventDefault();

            var title = $('input[name="board-title"]').val(),
                name = slug(title);

            Boards.insert({
                title: title,
                name: name
            });
        }
    };

    Template.boards.init_sortable = function() {
        Meteor.setTimeout(function() {
            var name = Session.get('board-name'),
                board = Boards.findOne({name: name});

            $('.sortable').ready(function() {
                $( ".sortable" ).sortable({
                    revert: 100,
                    connectWith: ".sortable"
                });
            });
            $('.sortable').bind("sortstop", function(event, ui) {
                var cards = (board.todo || []).concat(board.doing || []).concat(board.done || []),
                    ids = {
                        todo: $.map($('.sortable.todo .card'), function(item){ return item.dataset.id }),
                        doing: $.map($('.sortable.doing .card'), function(item){ return item.dataset.id }),
                        done: $.map($('.sortable.done .card'), function(item){ return item.dataset.id }),
                    };

                board.todo = cards.filter(function(item) {
                    return ids.todo.indexOf(item.id) > -1;
                });
                board.doing = cards.filter(function(item) {
                    return ids.doing.indexOf(item.id) > -1;
                });
                board.done = cards.filter(function(item) {
                    return ids.done.indexOf(item.id) > -1;
                });

                Boards.update({_id: board._id}, board);
            });

            $('.editable').editable(function(value, settings) {
                if(!$.trim(value)){
                    return;
                }

                var id = $(this).parents('.card').data('id'),
                    column = $(this).parents('.sortable').data('column');

                board[column] = board[column].map(function(item) {
                    if( item.id == id ){
                        item.title = value;
                    }

                    return item;
                });

                Boards.update({_id: board._id}, board);

                return value;
            });
        }, 200);
    };

    Template.boards.events = {
        'click .add-card': function(event) {
            var name = Session.get('board-name'),
                board = Boards.findOne({name: name}),
                column = event.target.dataset.column;

            board[column] = board[column] || [];
            board[column].push({
                id: randomString(),
                title: 'New card'
            });

            Boards.update({_id: board._id}, board);
        }
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

            '/boards/:name': function(name) {
                Session.set('page', 'boards');
                Session.set('board-name', name);
            }
        }).init();
    });
}

if (Meteor.is_server) {
    Meteor.startup(function () {});
}