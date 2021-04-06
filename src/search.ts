import fetch from 'node-fetch';
import userI from "./interfaces/userI";
import postI from "./interfaces/postI";
import geolocationI from "./interfaces/geolocationI";

export default class Task {
    private users: userI[];

    // Return users
    public getUsers = (): userI[] => this.users;

    // Fetch users and posts from api's
    public fetchData = async (): Promise<void> => {
        const posts:postI[] = await this.fetchPosts();
        this.users = await this.fetchUsers();
        this.connectPostsWithUsers(this.users, posts);
    };

    // Count how many posts each user has created
    public countUserPosts = (users: userI[]): string[] => {
        let userPosts: string[] = [];
        for (const user of users) {
            let countPosts:number = this.userPostsCount(user);
            userPosts.push(`${user.username} napisał(a) ${countPosts} postów`);
        }
        return userPosts;
    };

    // Return a list of titles that are not unique
    public repeatedTitles = (users: userI[]): string[] => {
        let uniqueTitles: string[] = [];
        let repeatedListOfTitles: string[] = [];
        for (const user of users) {
            if (user.posts === undefined)
                continue;
            for (const post of user.posts) {
                const title:string = post.title;
                if (uniqueTitles.includes(title)) {
                    repeatedListOfTitles.push(title)
                    continue;
                }
                uniqueTitles.push(title);
            }
        }
        return repeatedListOfTitles;
    };

    // For each user, find another user who lives closest to him
    public findClosestUser = (users: userI[]): string[] => {
        const totalUsersNumber: number = users.length;
        let closestUsers: string[] = [];
        let distancesBetweenUsers: number[][] = this.prepareArray(totalUsersNumber);
        for (let i = 0; i < totalUsersNumber; i++) {
            let closestUser: string;
            let minimalDistanceBetweenUsers: number;
            if (i === 0) // For the first user, only calculate the distance to second user and set it as shortest distance
                minimalDistanceBetweenUsers = this.calculateDistanceBetweenTwoUsers(users[0].address.geo, users[1].address.geo)
            else { // To reduce the number of calculations, use the previously calculated distances
                const {minimumDistance, closestUserIndex} = this.findMinimumDistanceFromPreviouslyCalculated(distancesBetweenUsers, i);
                minimalDistanceBetweenUsers = minimumDistance;
                closestUser = users[closestUserIndex].username;
            }

            for (let j = i + 1; j < totalUsersNumber; j++) {
                const distanceBetweenUsers:number = this.calculateDistanceBetweenTwoUsers(users[i].address.geo, users[j].address.geo)
                distancesBetweenUsers[i].push(distanceBetweenUsers);
                if (distanceBetweenUsers < minimalDistanceBetweenUsers) {
                    minimalDistanceBetweenUsers = distanceBetweenUsers;
                    closestUser = users[j].username;
                }
            }
            closestUsers.push(`Najbliżej użytkownika ${users[i].username} mieszka: ${closestUser}`);
        }
        return closestUsers;
    };

    // To reduce the number of calculations, find the closes living user among previously calculated distances
    private findMinimumDistanceFromPreviouslyCalculated = (distances: number[][], currentUser: number) => {
        let closestUserIndex: number = 0;
        let minimumDistance: number = distances[0][currentUser - 1] || undefined;

        if (minimumDistance === undefined) return null; // Check that the distances for this user are calculated

        for (let i = 0; i < currentUser; i++) {
            const userDistance = distances[currentUser - 1 - i][i];
            if (userDistance < minimumDistance) {
                minimumDistance = userDistance;
                closestUserIndex = currentUser - 1 - i;
            }
        }
        return {minimumDistance, closestUserIndex};
    };

    // Calculate distance between users using Haversine formula
    private calculateDistanceBetweenTwoUsers = (startPoint: geolocationI, endPoint: geolocationI): number => {
        const toRadian = (angle: number) :number => (Math.PI / 180) * angle;
        const distance = (a: number, b: number):number => (Math.PI / 180) * (a - b);
        const RadiusOfEarthInKm:number = 6371;

        const dLatitude:number = distance(endPoint.lat, startPoint.lat);
        const dLongitude:number = distance(endPoint.lng, startPoint.lng);

        startPoint.lat = toRadian(startPoint.lat);
        endPoint.lat = toRadian(endPoint.lat);

        //Haversine formula
        const a:number = Math.pow(Math.sin(dLatitude / 2), 2) +
            Math.pow(Math.sin(dLongitude / 2), 2) * Math.cos(startPoint.lat) * Math.cos(endPoint.lat);
        const c:number = 2 * Math.asin(Math.sqrt(a));
        return RadiusOfEarthInKm * c;
    };

    // Count user posts
    private userPostsCount = (user: userI): number => {
        return (user.posts === undefined)?0 : user.posts.length;
    };

    // Add posts to users objects
    private connectPostsWithUsers = (users: userI[], posts:postI[]): void => {
        let postsToAdd: postI[] = [];
        let previousUserId: number = 0;
        for (const post of posts) {
            if (post.userId !== previousUserId) { // To reduce complexity, only add posts to a User Object if the next post was created by another user
                this.addPostsToUser(users, previousUserId, postsToAdd);
                postsToAdd.length = 0;
            }
            previousUserId = post.userId;
            postsToAdd.push(post);
        }
        this.addPostsToUser(users, previousUserId, postsToAdd);
    };

    // Get users from API
    private fetchUsers = async (): Promise<userI[]> => {
        const user = await fetch('https://jsonplaceholder.typicode.com/users');
        return await user.json();
    };

    // Get posts from API
    private fetchPosts = async (): Promise<postI[]> => {
        const post = await fetch('https://jsonplaceholder.typicode.com/posts');
        return await post.json();
    };

    // Add all posts created by user to its object
    private addPostsToUser = (users:userI[], userId: number, postsToAdd: postI[]): void => {
        for (const user of users) {
            if (user.id === userId) {
                if (user.posts === undefined) { // If user has any posts yet, create empty list
                    user.posts = [];
                }
                for (const posts of postsToAdd) {
                    user.posts.push(posts);
                }
                break;
            }
        }
    };

    // Prepare empty two-dimensional array
    private prepareArray = (userAmount: number): number[][] => {
        let newArray: number[][] = [];
        for (let i = 0; i < userAmount; i++) {
            newArray.push([])
        }
        return newArray;
    };
}