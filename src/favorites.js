document.addEventListener('DOMContentLoaded', function () {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    function displayFavorites() {
        const favoriteList = document.getElementById('favoriteList');
        if (!favoriteList) {
            console.error('FavoriteList element not found.');
            return;
        }
        favoriteList.innerHTML = '';

        if (favorites.length === 0) {
            const noFavoritesMessage = document.createElement('p');
            noFavoritesMessage.textContent = 'You have no favorite meals yet.';
            favoriteList.appendChild(noFavoritesMessage);
        } else {
            favorites.forEach((meal) => {
                const favoriteItem = document.createElement('li');
                favoriteItem.dataset.mealId = meal.idMeal;

                const mealImage = document.createElement('img');
                mealImage.src = meal.strMealThumb;
                mealImage.alt = meal.strMeal;
                favoriteItem.appendChild(mealImage);

                const mealName = document.createElement('span');
                mealName.textContent = meal.strMeal;
                favoriteItem.appendChild(mealName);

                favoriteItem.addEventListener('click', function() {
                    displayMealDetailsById(meal.idMeal);
                });

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Remove';
                deleteButton.dataset.mealId = meal.idMeal;
                deleteButton.addEventListener('click', function(event) {
                    event.stopPropagation();
                    removeFromFavorites(meal.idMeal);
                });
                favoriteItem.appendChild(deleteButton);

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.dataset.mealId = meal.idMeal;
                editButton.addEventListener('click', function(event) {
                    event.stopPropagation();
                    editFavorite(meal.idMeal);
                });
                favoriteItem.appendChild(editButton);

                favoriteList.appendChild(favoriteItem);
            });
        }
    }

    function removeFromFavorites(mealId) {
        favorites = favorites.filter(fav => fav.idMeal !== mealId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }

    function editFavorite(mealId) {
        const meal = favorites.find(fav => fav.idMeal === mealId);
        if (!meal) {
            console.error('Meal not found in favorites.');
            return;
        }

        const displayMealDetails = document.getElementById('displayMealDetails');
        if (!displayMealDetails) {
            console.error('displayMealDetails element not found.');
            return;
        }
        displayMealDetails.innerHTML = '';

        const form = document.createElement('form');
        form.id = 'editForm';

        const mealNameLabel = document.createElement('label');
        mealNameLabel.textContent = 'Meal Name:';
        const mealNameInput = document.createElement('input');
        mealNameInput.type = 'text';
        mealNameInput.value = meal.strMeal;
        form.appendChild(mealNameLabel);
        form.appendChild(mealNameInput);

        const mealOriginLabel = document.createElement('label');
        mealOriginLabel.textContent = 'Origin:';
        const mealOriginInput = document.createElement('input');
        mealOriginInput.type = 'text';
        mealOriginInput.value = meal.strArea;
        form.appendChild(mealOriginLabel);
        form.appendChild(mealOriginInput);

        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient) {
                const ingredientLabel = document.createElement('label');
                ingredientLabel.textContent = `Ingredient ${i}:`;
                const ingredientInput = document.createElement('input');
                ingredientInput.type = 'text';
                ingredientInput.value = ingredient;
                const measureInput = document.createElement('input');
                measureInput.type = 'text';
                measureInput.value = measure;
                form.appendChild(ingredientLabel);
                form.appendChild(ingredientInput);
                form.appendChild(measureInput);
            }
        }

        const instructionsLabel = document.createElement('label');
        instructionsLabel.textContent = 'Instructions:';
        const instructionsInput = document.createElement('textarea');
        instructionsInput.value = meal.strInstructions;
        form.appendChild(instructionsLabel);
        form.appendChild(instructionsInput);

        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.textContent = 'Save';
        saveButton.addEventListener('click', function() {
            saveFavorite(mealId, mealNameInput.value, mealOriginInput.value, instructionsInput.value, form);
        });
        form.appendChild(saveButton);

        displayMealDetails.appendChild(form);
    }

    function saveFavorite(mealId, newName, newOrigin, newInstructions, form) {
        const meal = favorites.find(fav => fav.idMeal === mealId);
        if (!meal) {
            console.error('Meal not found in favorites.');
            return;
        }

        meal.strMeal = newName;
        meal.strArea = newOrigin;
        meal.strInstructions = newInstructions;

        for (let i = 1; i <= 20; i++) {
            const ingredientInput = form.querySelector(`input:nth-of-type(${i * 2 - 1})`);
            const measureInput = form.querySelector(`input:nth-of-type(${i * 2})`);
            if (ingredientInput && measureInput) {
                meal[`strIngredient${i}`] = ingredientInput.value;
                meal[`strMeasure${i}`] = measureInput.value;
            }
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
        showNotification('Meal details updated successfully!', '#4CAF50');

        const displayMealDetails = document.getElementById('displayMealDetails');
        if (displayMealDetails) {
            displayMealDetails.innerHTML = '';
        }
    }

    function displayMealDetailsById(mealId) {
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;
    
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(data => {
                const meal = data.meals[0];
                const displayMealDetails = document.getElementById('displayMealDetails');
                if (!displayMealDetails) {
                    console.error('displayMealDetails element not found.');
                    return;
                }
                displayMealDetails.innerHTML = '';
    
                const mealName = document.createElement('h2');
                mealName.textContent = meal.strMeal;
                displayMealDetails.appendChild(mealName);
    
                const mealOrigin = document.createElement('p');
                mealOrigin.textContent = `Origin: ${meal.strArea}`;
                displayMealDetails.appendChild(mealOrigin);
    
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
    
                const instructions = document.createElement('p');
                instructions.textContent = `Instructions: ${meal.strInstructions}`;
                displayMealDetails.appendChild(instructions);
    
                const mealLink = document.createElement('a');
                mealLink.href = meal.strSource || `https://www.themealdb.com/meal/${meal.idMeal}`;
                mealLink.textContent = 'View Full Recipe';
                mealLink.target = '_blank';
                displayMealDetails.appendChild(mealLink);
            })
            .catch(error => {
                console.error('Error fetching meal details:', error);
            });
    }
    

    function showNotification(message, backgroundColor) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '10px';
        notification.style.backgroundColor = backgroundColor;
        notification.style.color = 'white';
        notification.style.borderRadius = '5px';
        document.body.appendChild(notification);

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    displayFavorites();
});
