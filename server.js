const fs = require('fs');
const http = require('http');    // for hosting our server
const https = require('https');  // for the API

const port = 3000;

const server = http.createServer();
server.on("request", request_handler);   // any request for the data 
server.on("listening", listen_handler);
server.listen(port);

function listen_handler(){
	console.log(`Now Listening on Port ${port}`);
}
function request_handler(req, res){
    console.log(req.url);
    if(req.url === "/"){
        const form = fs.createReadStream("html/index.html");
		res.writeHead(200, {"Content-Type": "text/html"})
		form.pipe(res);
    }
    else if(req.url.startsWith("/search")){
        const user_input = new URL(req.url, `https://${req.headers.host}`).searchParams;     
        console.log(user_input);
        const location = user_input.get('location');   // gets location
        if(location == null || location == ""){
            res.writeHead(404, {"Content-Type": "text/html"}); 
            res.end("<h1>Missing Input</h1>");        
        }
        else{
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
            const vacations = https.request(options, (res) => {
                const chunks = [];
	            res.on('data', function (chunk) {
		            chunks.push(chunk);
	            });

	            res.on('end', function () {
		            const body = Buffer.concat(chunks);
		            console.log(body.toString());
                });  
            
            });
        }
    }

    else{
        res.writeHead(404, {"Content-Type": "text/html"});
        res.end("<h1>Not Found</h1>");    
    }
}