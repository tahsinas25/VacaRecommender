const express = require('express');
const app = express();
const path = require('path');
const https = require('https');  // for the API call
const api_key = require('./secret/credentials.json')


const PORT = 3000 || process.env.PORT;

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

// middleware for form data
app.use(express.urlencoded({ extended: false}));
// middleware for json data
app.use(express.json());
// middleware for static files
app.use(express.static(path.join(__dirname, '/public')));

// route_handler for '/' (exclusively) and /index.html
app.get('^/$|/index(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/search(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'search.html'));
    // make the API call when the user enter click destination  
});

app.get('/destination', (req, res) => {
    const user_input = new URL(req.url, `https://${req.headers.host}`).searchParams;     
    const city = user_input.get('city');   // gets city name
    console.log(city);
    if (city == null || city == ""){
        res.writeHead(404, {"Content-Type": "text/html"}); 
        res.end("<h1>Missing Input</h1>");        
    }
    
    else {
        let key = api_key[0]["API-KEY"] 
        const options = {
            method: 'GET',
            hostname: 'ai-trip-planner.p.rapidapi.com',
            port: null,
            path: `/?days=1&destination=${encodeURIComponent(city)}`,
            headers: {
                'X-RapidAPI-Key': key,
                'X-RapidAPI-Host': 'ai-trip-planner.p.rapidapi.com'
            }
        };
        let body = '';
        // requesting the vacation plan from the API 
        const vacations = https.request(options, (response) => {
            console.log('request made');
            const chunks = [];
            response.on('data', function (chunk) {
                chunks.push(chunk);
            });

            response.on('end', function () {
                body = Buffer.concat(chunks);   // buffer
                body = `${body.toString()}` // string
                process_plan(body);
            });  
        });
        vacations.end(); 
    }
    
    function process_plan(response) {
        let trip = `<html>
                    <style>
                        .trip {
                            text-align: center;
                            background-image: url('/img/trip-plan.png');
                        }
                        h2 {
                            text-align: center;
                            text-decoration: underline;
                        }
                    </style>
                    <body class="trip">`
        let body = '';
        try {
            body = JSON.parse(response) // parse the response string into a json object
            body = body.plan  // array of plans 
        } catch (err) {
            console.log('Error parsing JSON:', err)
        }
        // process the plan array 
        for(i = 0; i < body.length; i++) {
            trip += `<h2>One Day Trip Plan</h2>`
            let activities = body[i]['activities']  // json object containing all the activities
            for(j = 0; j < activities.length; j++) {
                trip += `<h4>Time - ${activities[j]['time']}</h4><p>Plan - ${activities[j]['description']}<p>`
            }
        } 

        trip += `</body>
                </html>`
        res.send(trip);
    } 

});

app.all('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html')); 
});

