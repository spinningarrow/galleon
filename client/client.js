Meteor.subscribe('expenditures')

// Routing
Router.configure({
	layoutTemplate: 'layout'
})

Router.map(function () {
	this.route('home', {
		path: '/',
		template: 'create'
	})

	this.route('details', {
		path: '/details'
	})
})