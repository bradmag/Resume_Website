/* This will hold the fitness server to interact with the database */

const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

let db = new sqlite3.Database('../../../../../SQL/Databases/Workout_Database/workout_database.db', (err) => {
    if(err) {
        console.error(err.message);
    }
    console.log('Connected to the Workout Database.');
});

app.post('/register', (req, res) => {/* register a new user*/
    const { username, email, password } = req.body;

    const sql = 'INSERT INTO Users (username, email, password, created_at, updated_at) VALUES (?, ?, ?, datetime("now"), datetime("now"))';
    db.run(sql, [username, email, password], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID, username, email }
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
