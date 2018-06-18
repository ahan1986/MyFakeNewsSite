// Dependencies
const express = require("express"), bodyParser = require("body-parser"), logger = require("morgan"), mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

//Require all models
const db = require("./models");

// Requiring all models
const PORT = 3000;

// Initializing Express
const app = express();

//Configure middleware
app.use(logger("dev"));
//Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//connect to the Mongo DB
mongoose.connect("mongodb://localhost/MyFakeNewsSite");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/MyFakeNewsSite";

// // Set mongoose to leverage built in JavaScript ES6 Promises
// // Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


// ROUTES
app.get('/', (req, res) => {
    res.render("landingPage");
});

app.get('/scrappedPage', (req, res) => {
    res.render("scrappedPage");
});

app.get("/all", (req, res) => {
    db.article.find({}, (error, found) => {
        if(error) throw error;

        else res.json(found);
    })
})

app.get("/scrape", (req, res) => {
    axios.get("https://www.csmonitor.com/").then((response) => {
        const $ = cheerio.load(response.data);
        let result = {};
console.log(" ======================= 1 =======================");
        $("div.ezz-bottom>.ezp-ezflow_block>ul>li").each((i, element) => {
            console.log(" ======================= 2 =======================");
            
            
            result.title = $(element).find("div.story_list_item").children("div.story_detail").find("h2.headline").text();

            result.body = $(element).find("div.story_detail").children("div.story_summary").children("p").text();

            result.url = $(element).find("div.story_detail").children("a").attr("href");

            result.img = $(element).find("div.story_list_item").children("div.story_thumbnail").children("a").children("figure").children("picture").children("source").attr("data-srcset");
            
            console.log(result);

            db.article.create(result)
            .then((Article) => {
                console.log(" ======================= 3 =======================");
                console.log(Article);
            })
            .catch((err) => {
                console.log(" ======================= 4 =======================");
                return res.json(err)
            }); 
        });
        console.log(" ======================= 5 =======================");

        res.send("Scrape Complete!");
    });
});



app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});