/* This will hold the JavaScript interactivity */

document.addEventListener('DOMContentLoaded', function() {
    // Check if this is the Recipe Book page
    if (!document.body.classList.contains('recipe_book_page')) {
        // Existing script for sidebar hover effect
        const hoverArea = document.querySelector('.hover-area');
        const sidebar = document.querySelector('.sidebar');
        const contentWrapper = document.querySelector('.content_wrapper');

        if (hoverArea && sidebar && contentWrapper) {
            hoverArea.addEventListener('mouseover', function() {
                sidebar.style.left = '0';
                contentWrapper.style.marginLeft = '220px';
            });

            sidebar.addEventListener('mouseleave', function() {
                sidebar.style.left = '-200px';
                contentWrapper.style.marginLeft = '20px';
            });
        } else {
            console.error("Sidebar or hover area elements not found in the DOM.");
        }
    }

    // Script for handling recipe form submission (adding new recipes)
    const recipeForm = document.getElementById('recipeForm');

    if (recipeForm) {
        recipeForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission

            // Get form values
            const recipeName = document.getElementById('recipeName').value;
            const process = document.getElementById('process').value;
            const ingredients = document.getElementById('ingredients').value.split(',').map(ingredient => ingredient.trim());

            // Create the recipe object
            const recipeData = {
                name: recipeName,
                process: process,
                ingredients: ingredients.map(name => ({ name }))
            };

            // Send a POST request to the server to add the new recipe
            fetch('http://localhost:3000/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recipeData),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                alert('Recipe added successfully!');
                // Optionally, clear the form
                recipeForm.reset();
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Error adding recipe.');
            });
        });
    } else {
        console.error("Recipe form not found in the DOM.");
    }

    // Script for handling recipe search by ingredients
    const searchForm = document.getElementById('searchForm');
    const searchResults = document.getElementById('searchResults');

    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission

            // Get search input values
            const searchIngredients = document.getElementById('searchIngredients').value.split(',').map(ingredient => ingredient.trim());

            // Send a GET request to the server to search for recipes
            fetch(`http://localhost:3000/recipes/search?ingredients=${encodeURIComponent(searchIngredients.join(','))}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Search Results:', data);
                    // Display search results
                    searchResults.innerHTML = '<h3>Search Results:</h3>';
                    if (data.data.length > 0) {
                        const resultsList = document.createElement('ul');
                        data.data.forEach(recipe => {
                            const listItem = document.createElement('li');
                            listItem.textContent = `${recipe.name}: ${recipe.process}`;
                            resultsList.appendChild(listItem);
                        });
                        searchResults.appendChild(resultsList);
                    } else {
                        searchResults.innerHTML += '<p>No recipes found for the given ingredients.</p>';
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                    searchResults.innerHTML = '<p>Error searching for recipes. Please try again later.</p>';
                });
        });
    } else {
        console.error("Search form not found in the DOM.");
    }
});
