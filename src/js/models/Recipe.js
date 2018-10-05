import axios from 'axios';
import {proxy, key} from '../config';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        
        try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
            this.data = res.data.recipe;
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.publisher_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
            //console.log(this.data);
        } catch (error) {
            alert(error);
        }
    }

    calcTime() {
        const numIngredients = this.ingredients.length;
        const periods = Math.ceil(numIngredients / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];

        const newIngredient = this.ingredients.map((el) => {
            // 1) Uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, index) => {
                ingredient = ingredient.replace(unit, unitsShort[index]);
            });

            // 2) Remove parantesis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // 3) Parse ingredients into count, unit and ingredients
            const arrIngredients = ingredient.split(' ');
            const unitIndex = arrIngredients.findIndex((el) => unitsShort.includes(el));

            let objIngredient;
            if (unitIndex > -1) {
                // there is a unit(tbsp, cup etc)
                // [1 1/2] or [1]
                const arrCount = arrIngredients.slice(0, unitIndex);
                let count;
                if (arrCount === 1) {
                    count = arrIngredients[0];
                } else {
                    count = eval(arrIngredients.slice(0, unitIndex).join('+'));
                }

                objIngredient = {
                    count,
                    unit: arrIngredients[unitIndex],
                    ingredient: arrIngredients.slice(unitIndex+1).join(' ') 
                }
            } 
            else if (parseInt(arrIngredients[0], 10)) {
                // no unit but first elemnt is number
                objIngredient = {
                    count: parseInt(eval(arrIngredients[0].replace('-', '+')),10),
                    unit: '',
                    ingredient: arrIngredients.slice(1).join(' ')
                }
            }
            else if (unitIndex === -1) {
                // no unit and no number at 1st position
                objIngredient = {
                    count:1,
                    unit:'',
                    ingredient
                }
            } 

            return objIngredient;

        });

        this.ingredients = newIngredient;
    }
}