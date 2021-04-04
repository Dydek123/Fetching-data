import fetch from 'node-fetch';
import dataI from "./interfaces/dataI";

export default class Task {
    private users : dataI[];
    private posts : object[];

    public async fetchData() {
        this.users = await this.fetchUsers();
        this.showUsers();
    }

    private async fetchUsers(): Promise<dataI[]> {
        const user = await fetch('https://jsonplaceholder.typicode.com/users');
        return await user.json();
    }

    public showUsers(): void{
        console.log(this.users)
    }
}