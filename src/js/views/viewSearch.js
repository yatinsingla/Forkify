import { DOMelements } from './base';

export const getInput = () => DOMelements.searchInput.value
export const clearInput = () => {
    DOMelements.searchInput.value = ''
}

export const clearSearchResults = () => {
    DOMelements.searchResultList.innerHTML = '';
    DOMelements.searchResultPages.innerHTML = ''
};

export const highlightSelected = (id) => {
    const resultArr = Array.from(document.querySelectorAll('.results__link'));
    resultArr.forEach(el => {
        el.classList.remove('results__link--active');
    })

    document.querySelector(`a[href="#${id}"]`).classList.add('results__link--active');
};

export const limitTitle = (title, limit = 17) => {
    const newTitle = [];

    if(title.length > limit) {
        title.split(' ').reduce((acc, cur) => {
            if(acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        },0);

        return `${newTitle.join(' ')} ...`;
    }

    return title;
}

const renderRecipe = (recipe) => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    DOMelements.searchResultList.insertAdjacentHTML('beforeend', markup);
};

const createButton = (page, type) => 
    `
        <button class="btn-inline results__btn--${type}" data-goto="${type === 'prev' ? page -1 : page + 1}">
            <span>Page ${type === 'prev' ? page -1 : page + 1}</span>    
            <svg class="search__icon">
                <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
            </svg>
        </button>
    `
;

const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults/resPerPage);
    let button;

    if(page === 1 && pages > 1) {
        // only one button to right/next
        button = createButton(page, 'next');
    } 
    else if (page < pages) {
        // 2 buttons both next and prev
        button = `
            ${createButton(page, 'prev')};
            ${createButton(page, 'next')};
        `;
    }
    else if (page === pages && pages > 1) {
        //only one button to left/prev
        button = createButton(page, 'prev');
    }

    DOMelements.searchResultPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResult = (data, page = 1, resPerPage = 10) => {
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;

    data.slice(start, end).forEach(el => renderRecipe(el));
    renderButtons(page, data.length, resPerPage);
};