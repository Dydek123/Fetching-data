import fetch from 'node-fetch';
import dataI from "./interfaces/dataI";
import postI from "./interfaces/postI";

export default class Task {
    private users : dataI[];
    private posts : postI[];

    public getUsers(): dataI[]{
        return this.users;
    }

    public async fetchData() {
        this.users = await this.fetchUsers();
        this.posts = await this.fetchPosts();
        this.connectData();
    }

    public showUsers(): void{
        console.log(this.users);
    }

    public showPosts(): void{
        console.log(this.posts);
    }

    public countUserPosts(users:dataI[]): string[]{
        let countPosts: string[] = [];
        for (const user of users) {
            let userPosts = this.userPostsAmount(user);
            countPosts.push(`${user.username} napisał(a) ${userPosts} postów`);
        }
        return countPosts;
    }

    private userPostsAmount(user: dataI): number{
        if (user.posts === undefined) return 0;
        return user.posts.length
    }

    private connectData(): void {
        let postsToAdd: postI[] = [];
        let previousUserId: number = 0;
        for (const post of this.posts) {
            if (post.userId !== previousUserId){
                this.addPostsToUser(previousUserId, postsToAdd);
                postsToAdd.length = 0;
            }
            previousUserId = post.userId;
            postsToAdd.push(post);
        }
        this.addPostsToUser(previousUserId, postsToAdd);
    }

    private async fetchUsers(): Promise<dataI[]> {
        const user = await fetch('https://jsonplaceholder.typicode.com/users');
        return await user.json();
    }

    private async fetchPosts(): Promise<postI[]> {
        const post = await fetch('https://jsonplaceholder.typicode.com/posts');
        return await post.json();
    }

    private addPostsToUser(userId: number, postsToAdd: postI[]) {
        for (const user of this.users) {
            if (user.id === userId) {
                if (user.posts === undefined){
                    user.posts = [];
                }
                for (const posts of postsToAdd) {
                    user.posts.push(posts);
                }
                break;
            }
        }
    }
}