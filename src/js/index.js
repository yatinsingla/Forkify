// Global app controller

import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import { DOMelements, renderLoader, clearLoader } from './views/base';
import * as viewSearch from './views/viewSearch';
import * as viewRecipe from './views/viewRecipe';
import * as viewList from './views/viewList';
//import { stat } from 'fs';

/* Global state of the app
*   - Search Object
*   - Current recipe Object
*   - Shopping list Object
*   - Liked recipes
*/

const state = {}
window.state = state;

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
                viewRecipe.renderRecipes(state.recipe);
                console.log(state.recipe);
            } catch (error) {
                alert("control recipe error index.js",error);
            }
            
    }
}

//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach((event) => addEventListener(event, controlRecipe));


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
        if(val > 0) state.list.updateItem(id, val);
    }
});

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
        controlList();
    }
    //console.log(state.recipe.ingredients);
});

