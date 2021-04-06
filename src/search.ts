import fetch from 'node-fetch';
import dataI from "./interfaces/dataI";
import postI from "./interfaces/postI";
import geolocationI from "./interfaces/geolocationI";

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

    public repeatedTitles(users: dataI[]): string[]{
        let uniqueList:string[] = [];
        let repeatedList: string[] =[];
        for (const user of users){
            if (user.posts === undefined)
                continue;
            for (const post of user.posts){
                const title = post.title;
                if (uniqueList.includes(title)){
                    repeatedList.push(title)
                    continue;
                }
                uniqueList.push(title);
            }
        }
        return repeatedList;
    }

    public findClosestUser(users: dataI[]): string[]{
        const userAmount:number = users.length;
        let resultArray: string[] = [];
        let distances: number[][] = this.prepareArray(userAmount);
        for (let i = 0; i < userAmount; i++) {
            let closestUser:string;
            let minDistance:number;
            if (i === 0) minDistance = this.calculateDistanceBetweenTwoPoints(users[0].address.geo, users[1].address.geo)
            else {
                const {minimumDistance, closestUserIndex} = this.findMinimumDistanceFromPreviouslyCalculated(distances, i, userAmount);
                minDistance = minimumDistance;
                closestUser = users[closestUserIndex].username;
            }

            for (let j = i+1; j < userAmount; j++) {
                const distanceBetweenUsers = this.calculateDistanceBetweenTwoPoints(users[i].address.geo, users[j].address.geo)
                distances[i].push(distanceBetweenUsers);
                if (distanceBetweenUsers<minDistance) {
                    minDistance = distanceBetweenUsers;
                    closestUser = users[j].username;
                }
            }
            resultArray.push(`Najbliżej użytkownika ${users[i].username} mieszka: ${closestUser}`);
        }
        return resultArray;
    }

    private findMinimumDistanceFromPreviouslyCalculated(distances: number[][], currentUser:number, userAmount:number) {
        let minimumDistance:number = distances[0][currentUser-1] || undefined;
        if (minimumDistance === undefined) return null;
        let closestUserIndex:number = 0;
        for (let i = 0; i < currentUser ; i++) {
            const userDistance = distances[currentUser-1-i][i];
            if (userDistance === undefined) break;
            if (userDistance < minimumDistance) {
                minimumDistance = userDistance;
                closestUserIndex = currentUser-1-i;
            }
        }
        return {minimumDistance, closestUserIndex};
    }

    private calculateDistanceBetweenTwoPoints(startPoint:geolocationI, endPoint: geolocationI) : number{
        const toRadian = (angle:number) => (Math.PI / 180) * angle;
        const distance = (a:number, b:number) => (Math.PI / 180) * (a - b);
        const RadiusOfEarthInKm = 6371;

        const dLatitude = distance(endPoint.lat, startPoint.lat);
        const dLongitude = distance(endPoint.lng, startPoint.lng);

        startPoint.lat = toRadian(startPoint.lat);
        endPoint.lat = toRadian(endPoint.lat);

        const a = Math.pow(Math.sin(dLatitude / 2), 2) +
            Math.pow(Math.sin(dLongitude / 2), 2) * Math.cos(startPoint.lat) * Math.cos(endPoint.lat);
        const c = 2 * Math.asin(Math.sqrt(a));
        return RadiusOfEarthInKm * c;
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

    private prepareArray(userAmount: number):number[][] {
        let newArray:number[][] = [];
        for (let i = 0; i < userAmount; i++) {
            newArray.push([])
        }
        return newArray;
    }
}