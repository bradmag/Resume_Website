const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); // Allows requests to and from different origins
app.use(bodyParser.json());

let db = new sqlite3.Database('../../../../../SQL/Databases/RecipeBook/recipe_book.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the recipe_book database.');
});

// Test query to check database access
db.all('SELECT name FROM recipes', [], (err, rows) => {
    if (err) {
        console.error('Error fetching data: ', err.message);
        return;
    }
    console.log('Recipes in database:');
    rows.forEach((row) => {
        console.log(row.name);
    });
});

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to the Recipe Book API');
});

// API to get recipes by a specific ingredient
app.get('/recipes/ingredient/:name', (req, res) => {
    const { name } = req.params;
    const sql = `
        SELECT r.name, r.process
        FROM recipes r
        JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        JOIN ingredients i ON i.id = ri.ingredient_id
        WHERE i.name = ?
    `;
    db.all(sql, [name], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// API to add a new recipe
app.post('/recipes', (req, res) => {
    const { name, process, ingredients } = req.body; // Extract data from the request body

    // Step 1: Insert the recipe into the recipes table
    const sql = 'INSERT INTO recipes (name, process) VALUES (?, ?)';
    db.run(sql, [name, process], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message }); // Handle errors
            return;
        }
        const recipeId = this.lastID; // Get the ID of the newly inserted recipe

        // Step 2: Insert each ingredient and link it to the recipe
        const ingredientSql = 'INSERT INTO ingredients (name) VALUES (?)';
        const recipeIngredientSql = 'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, ingredient_name) VALUES (?, ?, ?)';

        const findIngredientSql = 'SELECT id FROM ingredients WHERE name = ?';

        ingredients.forEach(ingredient => {
            // Step 2.1: Check if the ingredient already exists
            db.get(findIngredientSql, [ingredient.name], (err, row) => {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }

                if (row) {
                    // Ingredient exists, use the existing ingredient's ID and name
                    const ingredientId = row.id;
                    db.run(recipeIngredientSql, [recipeId, ingredientId, row.name], (err) => {
                        if (err) {
                            res.status(400).json({ "error": err.message });
                        }
                    });
                } else {
                    // Ingredient does not exist, insert it and use the new ID
                    db.run(ingredientSql, [ingredient.name], function(err) {
                        if (err) {
                            res.status(400).json({ "error": err.message });
                            return;
                        }
                        const ingredientId = this.lastID; // Get the ID of the newly inserted ingredient
                        db.run(recipeIngredientSql, [recipeId, ingredientId, ingredient.name], (err) => {
                            if (err) {
                                res.status(400).json({ "error": err.message });
                            }
                        });
                    });
                }
            });
        });

        // Step 3: Send a success response back to the client
        res.json({
            "message": "success",
            "data": { id: recipeId, name, process, ingredients },
            "id": recipeId
        });
    });
});

// API to search for recipes by multiple ingredients
app.get('/recipes/search', (req, res) => {
    const ingredients = req.query.ingredients.split(',').map(ingredient => ingredient.trim());

    // SQL query to find recipes that contain all the specified ingredients
    const placeholders = ingredients.map(() => '?').join(',');
    const sql = `
        SELECT r.id, r.name, r.process, GROUP_CONCAT(i.name, ', ') as ingredients
        FROM recipes r
        JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        JOIN ingredients i ON i.id = ri.ingredient_id
        WHERE i.name IN (${placeholders})
        GROUP BY r.id
        HAVING COUNT(DISTINCT i.name) = ?
    `;

    db.all(sql, [...ingredients, ingredients.length], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
