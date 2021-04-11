var fetch = require("node-fetch");
const NodeGeocoder = require('node-geocoder');
const geolib = require('geolib');
const axios = require("axios");

//to do: add all api keys from local.settings.json into config file on azure portal 

module.exports = async function (context, req) {
    //req to return array of addresses/meal preferences
    context.log('JavaScript HTTP trigger function processed a request.');
 
    // var body = req.body;

    // var addresses = body.addresses;

    // var preferences = body.preferences;

    const options = {
        provider: 'mapquest',
        apiKey: process.env['mapquestKey'] 
    };
    
    const geocoder = NodeGeocoder(options);

    var preferences = ['burger', 'taco', 'ice cream'];

    var addresses = ['586 water tower road south manteno', '1250 south halsted street chicago', '233 S Wacker Dr, Chicago, IL'];
    
    var addressCoordinates = [];
    
    for(const address of addresses)
    {
        const res = await geocoder.geocode(address);
        addressCoordinates.push( {latitude: res[0]["latitude"], longitude: res[0]["longitude"]} );
    }

    //to do: add support for 2+ multiple addresses from user
    //const res1 = await geocoder.geocode('586 water tower road south manteno');
    //const res2 = await geocoder.geocode('1250 south halsted street chicago');

    var centerCoords = geolib.getCenterOfBounds(addressCoordinates);

    var testResult = await getNearbyRestaurants(centerCoords["latitude"], centerCoords["longitude"], preferences);

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: testResult
        //name, image_url, restaurant url, center latitude, center longitude for map, 
    };
}

function getNearbyRestaurants(lat, long, preferences)
{
    const apiKey = process.env['yelpKey'];

    /*query = "";
    for(const preference of preferences)
    {
        query += preference;
        query += " ";
    }*/

    let params = {
        categories: "coffee,burgers,italian",
        open_now: true,
        latitude: lat,
        longitude: long,
        limit: 20
    }

    let yelpREST = axios.create({
        baseURL: "https://api.yelp.com/v3/",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-type": "application/json",
        },
    })

    return new Promise(function (resolve, reject) {
        yelpREST("/businesses/search", {params: params}).then(({data})=> {
            resolve(data);
        },
            (error) => {reject(error)}
        );
    })
    
    // other params to consider - price, open_now, open_at, attributes, sort_by?, radius instead of limit?
}