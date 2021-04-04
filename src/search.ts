import fetch from 'node-fetch';
import dataI from "./interfaces/dataI";

export default class Task {
    private users : dataI[];
    private posts : object[];

    public async fetchData() {
        this.users = await this.fetchUsers();
        this.posts = await this.fetchPosts();
        this.showPosts();
    }

    public showUsers(): void{
        console.log(this.users);
    }

    public showPosts(): void{
        console.log(this.posts);
    }

    private async fetchUsers(): Promise<dataI[]> {
        const user = await fetch('https://jsonplaceholder.typicode.com/users');
        return await user.json();
    }

    private async fetchPosts(): Promise<dataI[]> {
        const post = await fetch('https://jsonplaceholder.typicode.com/posts');
        return await post.json();
    }

}