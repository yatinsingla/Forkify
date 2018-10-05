// Global app controller

import Search from './models/Search';
import Recipe from './models/Recipe';
import { DOMelements, renderLoader, clearLoader } from './views/base';
import * as viewSearch from './views/viewSearch';

/* Global state of the app
*   - Search Object
*   - Current recipe Object
*   - Shopping list Object
*   - Liked recipes
*/

const state = {}

const controlSearch = async () => {
    // 1) get query from view
    const query = viewSearch.getInput();
    console.log(query);
    if(query) {
        // 2) new search object and add to state
        // const search = new Search('pizza'); search.getResults(); // mimicing this
        state.search = new Search(query); // storing in the global state object i.e. state
        
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

        // Create new Recipe Order

        // Get Recipe data and parseIngredients
        state.recipe = new Recipe(id);
        await state.recipe.getRecipe();
        
        window.r = state.recipe;
        console.log(r.ingredients);
        // Calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();
        // Render recipe

        console.log(state.recipe);
    }
}

//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach((event) => addEventListener(event, controlRecipe));