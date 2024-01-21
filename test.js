const http = require('https');

const options = {
	method: 'GET',
	hostname: 'ai-trip-planner.p.rapidapi.com',
	port: null,
	path: '/?days=3&destination=London%2CUK',
	headers: {
		'X-RapidAPI-Key': 'f58fc5a122mshc89ec28cdccf17fp12bc53jsndca1eaf35100',
		'X-RapidAPI-Host': 'ai-trip-planner.p.rapidapi.com'
	}
};

const req = http.request(options, function (res) {
	const chunks = [];

	res.on('data', function (chunk) {
		chunks.push(chunk);
	});

	res.on('end', function () {
		const body = Buffer.concat(chunks);
		console.log(body.toString());
	});
});

req.end();