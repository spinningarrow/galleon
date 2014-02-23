//--------------------------------------------------------------------
// Template: Index
//--------------------------------------------------------------------

// Temporary hack in place of actual router-based logic
Template.index.events({
	'click .show-create, click .site-title': function (event, template) {
		// These sections are only available to signed-in users
		if (!Meteor.user()) {
			return
		}

		template.find('.template-details').className += ' hidden'

		var templateCreateElement = template.find('.template-create')

		// Twirly 'removeClass' implementation
		templateCreateElement.className = _.without(templateCreateElement.className.split(' '), 'hidden').join(' ')
	},

	'click .show-details': function (event, template) {
		template.find('.template-create').className += ' hidden'

		var templateDetailsElement = template.find('.template-details')

		// Twirly 'removeClass' implementation
		templateDetailsElement.className = _.without(templateDetailsElement.className.split(' '), 'hidden').join(' ')
	}
})