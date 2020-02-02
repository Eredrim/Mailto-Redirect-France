const services = [
	{ id : 'orange', name : 'Webmail Orange', url : 'https://webmail.orange.fr/webmail/fr_FR/write.html', params: {writeTo: '#to'} },
	{ id : 'free', name : 'Webmail Zimbra Free', url : 'https://zimbra.free.fr' },
	{ id : 'outlook', name : 'outlook.com', url : 'https://outlook.live.com/owa/0/', params: {path: '/mail/action/compose', to: '#to', subject: '#subject', body: '#body'} }
];

const index = {
	props: ['services'],
	template: '#index-template',
	methods: {
		registerService: function(service){
			const redirectorUrl = `${window.location.href}redirect/${service.id}?href=%s`
			navigator.registerProtocolHandler("mailto", redirectorUrl, service.name);
		}
	}
};

function parseInformations(mailtoString) {
	const query = {};
	const queryString = mailtoString.replace(/mailto(:|%3A)/gi, '');
	const splittedQuery = queryString.split('?');
	query.to = splittedQuery[0];
	if(splittedQuery.length > 1) {
		var options = splittedQuery[1].split('&');
		for (var i = 0; i < options.length; i++) {
			var pair = options[i].split('=');
			query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
		}
	}
    return query;
}

function buildUrl(service, redirectData) {
	let redirectUrl = `${service.url}?`;
	Object.entries(service.params).forEach(([key, val]) => {
		if(val.startsWith('#') && redirectData.hasOwnProperty(val.substring(1))) {
			const paramValue = redirectData[val.substring(1)];
			redirectUrl += `${key}=${paramValue}&`
		} else {
			redirectUrl += `${key}=${val}&`
		}
	});
	return redirectUrl.slice(0, -1);
}

const routes = [
	{ path: '', component: index },
	{ path: '/redirect/free', beforeEnter: request => { 
			const { params, query } = request;
			const service = services.find(s => s.id === 'free');
			window.location.replace(service.url);
		}
	},
	{ path: '/redirect/:serviceId', beforeEnter: request => { 
			const { params, query } = request;
			const service = services.find(s => s.id === params.serviceId);
			const redirectData = parseInformations(query.href);
			const redirectUrl = buildUrl(service, redirectData);
			window.location.replace(redirectUrl);
		}
	}
];

const router = new VueRouter({
	routes
});

var app = new Vue({ 
	router,
    el: '#app',
    data: {
        services
    }
});