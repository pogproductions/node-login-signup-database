// all imports
const bcrypt = require('bcrypt');
const express = require('express');

// Make the express app
const app = express();

app.set("port", process.env.PORT || 4000);

// set where static files such as html, images, css pages are located
app.use(express.static('public'));

// set how we will render to template files
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

const { MongoClient, ServerApiVersion, Db } = require('mongodb');
const uri = "mongodb+srv://krishbhardwaj250:falRPtg5tGaTFoGu@userdatabase.myn1jqr.mongodb.net/?retryWrites=true&w=majority&appName=UserDatabase";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
        console.log("Working now");
    }
}
run().catch(console.dir);

app.post("/getuser", async (req, res)=>{

    try {
        // Logging the body of the request
        console.log(req.body);
        const {username, password} = req.body;

        const db = client.db("UserDatabase");
        const createdUsersDatabase = db.collection("users");
        
        const existingUser = await createdUsersDatabase.findOne({username: username});

        if (existingUser) {
            const existingUserPassword = await bcrypt.compare(password, existingUser.password);
            if (existingUserPassword) {
                console.log("Login Successful");
                res.render("result");
            } else {
                res.render("Username taken or details did not match");
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            await createdUsersDatabase.insertOne({
                username,
                password: hashedPassword,
                createdAt: new Date()
            });

            res.render("signup");
        }
    } catch (err) {
        console.log(err);
    }
})


app.listen(app.get("port"), () => {
    console.log("running on " + app.get("port"));
});