App.Router.map(function() {

});

App.IndexRoute = Ember.Route.extend({
    setupController: function(controller){
        controller.set('title', 'Share Code');
    },
    renderTemplate: function() {
        this.render('main');
    }
});