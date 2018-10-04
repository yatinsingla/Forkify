import axios from 'axios';

export default class Search {
    constructor(query){
        this.query = query;
    }

    async getResults() {
        const proxy = 'http://cors-anywhere.herokuapp.com/';
        const key = '5807f5f1e5d451ee356337ce3e82a5ec';
        try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            this.data = res.data.recipes;
            //console.log(this.data);
        } catch (error) {
            alert(error);
        }
    }
}