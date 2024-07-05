document.addEventListener('DOMContentLoaded', function() {
    fetchRandomMeals(5); // Fetch and display 5 random meals

    fetchCategories();
    if (document.getElementById('favoriteList')) {
        displayFavorites(); // Display favorites if on favorites.html
    }

    // Function to fetch random meals
    function fetchRandomMeals(numberOfMeals) {
        const urls = Array.from({ length: numberOfMeals }, () => 'https://www.themealdb.com/api/json/v1/1/random.php');

        Promise.all(urls.map(url =>
            fetch(url)
                .then(response => response.json())
                .then(data => data.meals[0]) // Get the first meal from each response
        ))
        .then(meals => {
            displayMealResults(meals);
        })
        .catch(error => {
            console.error('Error fetching random meals:', error);
        });
    }

    // Function to fetch categories for dropdown
    function fetchCategories() {
        fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
            .then(response => response.json())
            .then(data => {
                const categories = data.categories;
                const categoryFilter = document.getElementById('categoryFilter');
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.strCategory;
                    option.textContent = category.strCategory;
                    categoryFilter.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    }

    // Event listener for the Search button
    const searchButton = document.getElementById('recipeButton');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const searchInput = document.getElementById('searchInput').value;
            const categoryFilter = document.getElementById('categoryFilter').value;
            let url = 'https://www.themealdb.com/api/json/v1/1/search.php';
            if (searchInput) {
                url += `?s=${searchInput}`;
            }

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    const meals = data.meals;
                    if (meals) {
                        categorizeAndDisplay(meals, categoryFilter);
                    } else {
                        displayNoResultsMessage();
                    }
                })
                .catch(error => {
                    console.error('Error fetching search results:', error);
                });
        });
    }

    // Function to categorize and display search results
    function categorizeAndDisplay(meals, categoryFilter) {
        if (categoryFilter) {
            const filteredMeals = meals.filter(meal => meal.strCategory === categoryFilter);
            displayMealResults(filteredMeals);
        } else {
            displayMealResults(meals);
        }
    }

    // Function to display search results
    function displayMealResults(meals) {
        const displayMeal = document.getElementById("displayMeal");
        if (displayMeal) {
            displayMeal.innerHTML = '';
            meals.forEach(meal => {
                const mealItem = createMealItem(meal);
                displayMeal.appendChild(mealItem);
            });
        } else {
            console.error('Element with id "displayMeal" not found.');
        }
    }

    // Function to create HTML elements for each meal item
    function createMealItem(meal) {
        const mealItem = document.createElement('li');
        mealItem.dataset.mealId = meal.idMeal;

        // Create image element for meal thumbnail
        const mealThumb = document.createElement('img');
        mealThumb.src = meal.strMealThumb;
        mealThumb.alt = meal.strMeal; // Optional: Set alt text
        mealItem.appendChild(mealThumb);

        // Create heading element for meal name
        const mealName = document.createElement('h3');
        mealName.textContent = meal.strMeal;
        mealItem.appendChild(mealName);

        // Add click event listener to show meal details
        mealItem.addEventListener('click', function(event) {
            displayMealDetails(event);
        });

        return mealItem;
    }

    // Function to display detailed meal information
    function displayMealDetails(event) {
        let mealItem = event.target;
        while (mealItem.tagName !== 'LI') {
            mealItem = mealItem.parentNode;
        }
        const mealId = mealItem.dataset.mealId;
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const meal = data.meals[0];
                const displayMealDetails = document.getElementById("displayMealDetails");
                if (displayMealDetails) {
                    displayMealDetails.innerHTML = '';

                    // Create image element for meal thumbnail
                    const mealThumb = document.createElement('img');
                    mealThumb.src = meal.strMealThumb;
                    mealThumb.alt = meal.strMeal; // Optional: Set alt text
                    displayMealDetails.appendChild(mealThumb);

                    // Create heading element for meal name
                    const mealName = document.createElement('h2');
                    mealName.textContent = meal.strMeal;
                    displayMealDetails.appendChild(mealName);

                    // Create paragraph element for meal origin
                    const mealOrigin = document.createElement('p');
                    mealOrigin.textContent = `Origin: ${meal.strArea}`;
                    displayMealDetails.appendChild(mealOrigin);

                    // Create unordered list for ingredients
                    const ingredientsList = document.createElement('ul');
                    ingredientsList.textContent = 'Ingredients:';
                    for (let i = 1; i <= 20; i++) {
                        const ingredient = meal[`strIngredient${i}`];
                        const measure = meal[`strMeasure${i}`];
                        if (ingredient) {
                            const listItem = document.createElement('li');
                            listItem.textContent = `${ingredient} - ${measure}`;
                            ingredientsList.appendChild(listItem);
                        }
                    }
                    displayMealDetails.appendChild(ingredientsList);

                    // Create paragraph element for instructions
                    const instructions = document.createElement('p');
                    instructions.textContent = `Instructions: ${meal.strInstructions}`;
                    instructions.classList.add('instructions'); // Add class for styling
                    displayMealDetails.appendChild(instructions);

                    // Create link element for full recipe
                    const mealLink = document.createElement('a');
                    mealLink.href = meal.strSource || `https://www.themealdb.com/meal/${meal.idMeal}`;
                    mealLink.textContent = 'View Full Recipe';
                    mealLink.target = '_blank';
                    mealLink.classList.add('view-recipe-button'); // Add new class
                    displayMealDetails.appendChild(mealLink);

                    // Create favorite button (heart icon)
                    const favoriteButton = document.createElement('button');
                    favoriteButton.id = 'addToFavoritesButton';
                    favoriteButton.classList.add('favorite-button');
                    favoriteButton.textContent = 'Add to Favorites'; // Updated text
                    favoriteButton.dataset.mealId = mealId;
                    favoriteButton.addEventListener('click', function(event) {
                        toggleFavorite(event, meal);
                    });
                    displayMealDetails.appendChild(favoriteButton);

                    // Check if meal is already in favorites
                    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
                    const isFavorite = favorites.some(favorite => favorite.idMeal === mealId);
                    if (isFavorite) {
                        favoriteButton.textContent = 'Remove from Favorites'; // Updated text
                    }

                    showNotification(`Meal: ${meal.strMeal}`); // Show notification with meal name
                }
            });
    }

    // Function to toggle favorite status of a meal
    function toggleFavorite(event, meal) {
        const favoriteButton = event.target;
        const mealId = meal.idMeal;
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        if (favorites.some(favorite => favorite.idMeal === mealId)) {
            favorites = favorites.filter(favorite => favorite.idMeal !== mealId);
            favoriteButton.textContent = 'Add to Favorites'; // Updated text
            showNotification('Removed from Favorites');
        } else {
            favorites.push(meal);
            favoriteButton.textContent = 'Remove from Favorites'; // Updated text
            showNotification('Added to Favorites');
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites(); // Update favorite list on favorites.html
    }

    // Function to display favorites on favorites.html
    function displayFavorites() {
        const favoriteList = document.getElementById('favoriteList');
        if (favoriteList) {
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            favoriteList.innerHTML = '';

            favorites.forEach(meal => {
                const mealItem = createFavoriteItem(meal);
                favoriteList.appendChild(mealItem);
            });
        }
    }

    // Function to create HTML elements for each favorite item
    function createFavoriteItem(meal) {
        const mealItem = document.createElement('li');
        mealItem.dataset.mealId = meal.idMeal;

        // Create image element for meal thumbnail
        const mealThumb = document.createElement('img');
        mealThumb.src = meal.strMealThumb;
        mealThumb.alt = meal.strMeal; // Optional: Set alt text
        mealItem.appendChild(mealThumb);

        // Create heading element for meal name
        const mealName = document.createElement('h3');
        mealName.textContent = meal.strMeal;
        mealItem.appendChild(mealName);

        // Add click event listener to show meal details
        mealItem.addEventListener('click', function(event) {
            displayMealDetails(event);
        });

        return mealItem;
    }

    // Function to show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
});
