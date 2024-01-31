const fs = require('fs');
const http = require('http');    // for hosting our server
const https = require('https');  // for the API
const cheerio = require('cheerio')
const api_key = require('./credentials.json')
const port = 3000;

const server = http.createServer();
server.on("request", request_handler);   // any request for the data; will be executed every time a search occurs
server.on("listening", listen_handler);
server.listen(port);

function listen_handler(){
	console.log(`Now Listening on Port ${port}`);
}

function request_handler(req, res) {

    if(req.url === "/"){
        const form = fs.createReadStream("../Frontend/index.html");  // reads the index.html file
		res.writeHead(200, {"Content-Type": "text/html"});  // 
		form.pipe(res);
    }
    else if(req.url.startsWith("/search")){
        const user_input = new URL(req.url, `https://${req.headers.host}`).searchParams;     
        const location = user_input.get('city');   // gets location
        if(location == null || location == ""){
            res.writeHead(404, {"Content-Type": "text/html"}); 
            res.end("<h1>Missing Input</h1>");        
        }
        else{
            let key = api_key[0]["API-KEY"] 
            const options = {
                method: 'GET',
                hostname: 'ai-trip-planner.p.rapidapi.com',
                port: null,
                path: `/?days=1&destination=${encodeURIComponent(location)}`,
                headers: {
                    'X-RapidAPI-Key': key,
                    'X-RapidAPI-Host': 'ai-trip-planner.p.rapidapi.com'
                }
            };

            let body = '';
            // requesting the vacation plan from the API 
            const vacations = https.request(options, (response) => {
                const chunks = [];
	            response.on('data', function (chunk) {
		            chunks.push(chunk);
	            });

	            response.on('end', function () {
		            body = Buffer.concat(chunks);
                    plan = `<p>${body}</p>`
                    console.log(plan)
                    process_plan(plan)
                });  
            });
            vacations.end()  // end the API request call
            // res is a writeable stream 
        }
    }
    else{
        res.writeHead(404, {"Content-Type": "text/html"});
        res.end("<h1>Not Found</h1>");    
    }


    function process_plan(response) {
        res.write("<h1>Trip Plan</h1><break><break><break><p>You're Welcome!</p>", () => {});
        let body = cheerio.load(response)('p').text();
        try {
            body = JSON.parse(body)
            body = body.plan  // array of plans 

        } catch (err) {
            console.log('Error parsing JSON:', err)
        }
        // process the plan array 
        let trip = `<div class="trip">`
        for(i = 0; i < body.length; i++) {
            trip += `Day: ${body[i]['day']} \n`
            let activities = body[i]['activities']  // json object containing all the activities
            for(j = 0; j < activities.length; j++) {
                trip += `Time: ${activities[j]['time']} \n Description: ${activities[j]['description']}\n`
            }
        }
        res.write(trip, () => {});
        res.end()
    }
}