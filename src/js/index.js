// Global app controller

import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import { DOMelements, renderLoader, clearLoader } from './views/base';
import * as viewSearch from './views/viewSearch';
import * as viewRecipe from './views/viewRecipe';
import * as viewList from './views/viewList';
import * as viewLikes from './views/viewLikes';

//import { stat } from 'fs';

/* Global state of the app
*   - Search Object
*   - Current recipe Object
*   - Shopping list Object
*   - Liked recipes
*/

const state = {}
window.state = state;

/////////// ******Search Controller****** //////////////////////

const controlSearch = async () => {
    // 1) get query from view
    const query = viewSearch.getInput();
    console.log(query);
    if(query) {
        // 2) new search object and add to state
        // const search = new Search('pizza'); search.getResults(); // mimicing this
        state.search = new Search(query); // storing in the global state object i.e. state
        try{
            // 3) prepare UI for results
        viewSearch.clearInput();
        viewSearch.clearSearchResults();
        renderLoader(DOMelements.searchResult);

        // 4) search for recipes
        await state.search.getResults(); // bcoz getResult() is an async func which returns a promise
        
        // 5) render results on UI
        clearLoader();
        viewSearch.renderResult(state.search.data);
        //console.log(state.search.data);
        } catch (error) {
            alert('Error in controlSearch index.js');
        }
        
    }
};

DOMelements.searchForm.addEventListener('submit', (event)=>{
    event.preventDefault();
    controlSearch();
});

DOMelements.searchResultPages.addEventListener('click', (event) => {
    const btn = event.target.closest('.btn-inline');
    console.log(btn);
    if(btn){
        const goToPage = parseInt(btn.dataset.goto);
        console.log(goToPage);
        viewSearch.clearSearchResults();
        viewSearch.renderResult(state.search.data, goToPage);
    }
});


/////////// ******Recipe Controller****** //////////////////////

const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if(id) {
        // Prepare UI for changes
        viewRecipe.clearRecipeResult();
        renderLoader(DOMelements.recipeList);
        
        // Highlight selected search item
        if(state.search) viewSearch.highlightSelected(id);

        // Create new Recipe Order        
        state.recipe = new Recipe(id);
            try {
                // Get Recipe data and parseIngredients
                await state.recipe.getRecipe();
                state.recipe.parseIngredients();

                // Calculate servings and time
                state.recipe.calcTime();
                state.recipe.calcServings();
                // Render recipe
                clearLoader();
                viewRecipe.clearRecipeResult();
                viewRecipe.renderRecipes(state.recipe, state.likes.isLiked(id));
                console.log(state.recipe);
            } catch (error) {
                alert("control recipe error index.js",error);
            }
            
    }
}

//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach((event) => addEventListener(event, controlRecipe));


/////////// ******List Controller****** //////////////////////

const controlList = () => {
    // create a new list if there is none yet
    if(!state.list) state.list = new List();

    // add each ingredient to the list
    state.recipe.ingredients.forEach((el) => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        viewList.renderItem(item);
    })
};

// handle delete and update list item events
DOMelements.shoppingList.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // handle delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        // delete from state
        state.list.deleteItem(id);

        // delete from UI
        viewList.deleteItem(id);

        // update count of item in shopping list
    } else if (e.target.matches('.shopping__count--value')) {
        const val = parseFloat(e.target.value, 10);
        //console.log(val);
        state.list.updateItem(id, val);
    }
});


/////////// ******Likes Controller****** //////////////////////
state.likes = new Likes();
const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe
    if( !state.likes.isLiked(currentID)) {
        // add like to the state
        const newLike = state.likes.addLikes(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        // toggle the like button
        viewLikes.toggleLikeBtn(true);

        // add like to the UI list
        viewLikes.renderLikes(newLike);
        console.log(state.likes);

    // User HAS liked current recipe
    } else {
        // remove like from the state
        state.likes.deleteLikes(currentID);

        // toggle the like button
        viewLikes.toggleLikeBtn(false);

        // remove like from the UI list
        viewLikes.deleteLike(currentID);
    }

    viewLikes.toggleLikeMenu(state.likes.getNumLikes());

}


// handling recipe button clicks (event delegation)
DOMelements.recipeList.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        // decrease button clicked
        if(state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            viewRecipe.updateServingsIngredients(state.recipe);
        }
        
    } else if(e.target.matches('.btn-increase, .btn-increase *')) {
        // increase button clicked
        state.recipe.updateServings('inc');
        viewRecipe.updateServingsIngredients(state.recipe);

    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // add ingredients to shopping list
        controlList();

    } else if(e.target.matches('.recipe__love, .recipe__love *')) {
        // like controller
        controlLike();
    }
    //console.log(state.recipe.ingredients);
});

