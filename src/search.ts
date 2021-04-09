import fetch from 'node-fetch';
import userI from "./interfaces/userI";
import postI from "./interfaces/postI";
import geolocationI from "./interfaces/geolocationI";
import {FetchError} from "./exceptions/FetchError";

export default class Task {
    private users: userI[];

    // Return users
    public getUsers = (): userI[] => this.users;

    // Fetch users and posts from APIs
    public fetchData = async (userApi: string, postsApi: string): Promise<void> => {
        const posts: postI[] = await this.fetchPosts(postsApi); // Get posts
        this.users = await this.fetchUsers(userApi); // Get users
        Task.checkFetchedPosts(posts); // Check the correctness of the fetched posts
        Task.checkFetchedUsers(this.users); // Check the correctness of the fetched users
        this.connectPostsWithUsers(this.users, posts); // Add posts to users
    };

    // Count how many posts each user has created
    public countUsersPosts = (users: userI[]): string[] => {
        Task.checkParameters(users);
        let usersPosts: string[] = [];
        for (const user of users) {
            let postsCount: number = this.countSingleUserPosts(user); // Count posts for single user
            usersPosts.push(`${user.username} napisał(a) ${postsCount} postów`);
        }
        return usersPosts;
    };

    // Return a list of titles that are not unique
    public repeatedTitles = (users: userI[]): string[] => {
        Task.checkParameters(users);
        let uniqueTitles: string[] = [];
        let repeatedListOfTitles: string[] = [];
        for (const user of users) {
            if (user.posts === undefined) // If the user has not created any post yet, go to the next user
                continue;
            for (const post of user.posts) {
                const title: string = post.title;
                // Check if it exists in the unique list of titles, if so check if they exist in the repeating list of titles to avoid duplicates
                if (uniqueTitles.includes(title) && !repeatedListOfTitles.includes(title)) {
                    repeatedListOfTitles.push(title);
                    continue;
                }
                uniqueTitles.push(title);
            }
        }
        return repeatedListOfTitles;
    };

    // For each user, find another user who lives closest to him
    public findClosestUser = (users: userI[]): string[] => {
        Task.checkParameters(users);
        if (users.length < 2) return []; // If there are less than 2 users, it cannot find another user

        const totalUsersNumber: number = users.length;
        let closestUsers: string[] = [];
        let distancesBetweenUsersMatrix: number[][] = this.prepareArray(totalUsersNumber); // Create empty two-dimensional array

        for (let i = 0; i < totalUsersNumber; i++) {
            let closestUser: string;
            let minimalDistanceBetweenUsers: number;

            if (i === 0) // For the first user, only calculate the distance to second user and set it as shortest distance
            {
                minimalDistanceBetweenUsers = this.calculateDistanceBetweenTwoUsers(users[0].address.geo, users[1].address.geo);
                closestUser = users[i + 1].username;
            } else { // To reduce the number of calculations, use the previously calculated distances
                const {minimumDistance, closestUserIndex} = this.findMinimumDistanceFromPreviouslyCalculated(distancesBetweenUsersMatrix, i);
                minimalDistanceBetweenUsers = minimumDistance;
                closestUser = users[closestUserIndex].username;
            }

            for (let j = i + 1; j < totalUsersNumber; j++) {
                const distanceBetweenUsers: number = this.calculateDistanceBetweenTwoUsers(users[i].address.geo, users[j].address.geo)
                distancesBetweenUsersMatrix[i].push(distanceBetweenUsers);
                if (distanceBetweenUsers < minimalDistanceBetweenUsers) {
                    minimalDistanceBetweenUsers = distanceBetweenUsers;
                    closestUser = users[j].username;
                }
            }

            closestUsers.push(`Najbliżej użytkownika ${users[i].username} mieszka: ${closestUser}`);
        }

        return closestUsers;
    };

    // To reduce the number of calculations, find the nearest living user among previously calculated distances
    private findMinimumDistanceFromPreviouslyCalculated = (distances: number[][], currentUser: number) => {
        let closestUserIndex: number = 0;
        let minimumDistance: number = distances[0][currentUser - 1] || undefined;

        if (minimumDistance === undefined) return null; // Check that the distances for this user have been calculated

        for (let i = 0; i < currentUser; i++) {
            const distanceBetweenUsers = distances[currentUser - 1 - i][i];
            if (distanceBetweenUsers < minimumDistance) {
                minimumDistance = distanceBetweenUsers;
                closestUserIndex = currentUser - 1 - i;
            }
        }
        return {minimumDistance, closestUserIndex};
    };

    // Calculate distance between users using Haversine formula
    private calculateDistanceBetweenTwoUsers = (startPoint: geolocationI, endPoint: geolocationI): number => {
        const toRadian = (angle: number): number => (Math.PI / 180) * angle;
        const distance = (a: number, b: number): number => (Math.PI / 180) * (a - b);
        const RadiusOfEarthInKm: number = 6371;

        const dLatitude: number = distance(endPoint.lat, startPoint.lat);
        const dLongitude: number = distance(endPoint.lng, startPoint.lng);

        startPoint.lat = toRadian(startPoint.lat);
        endPoint.lat = toRadian(endPoint.lat);

        //Haversine formula
        const a: number = Math.pow(Math.sin(dLatitude / 2), 2) +
            Math.pow(Math.sin(dLongitude / 2), 2) * Math.cos(startPoint.lat) * Math.cos(endPoint.lat);
        const c: number = 2 * Math.asin(Math.sqrt(a));
        return RadiusOfEarthInKm * c;
    };

    // Count user posts
    private countSingleUserPosts = (user: userI): number => {
        return (user.posts === undefined) ? 0 : user.posts.length;
    };

    // Add posts to users objects
    private connectPostsWithUsers = (users: userI[], posts: postI[]): void => {
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
    private fetchUsers = async (apiURL: string): Promise<userI[]> => {
        const user = await fetch(apiURL);
        if (!user.ok) {
            throw new FetchError('Cannot get users from API');
        }
        return user.json();
    };

    // Get posts from API
    private fetchPosts = async (apiURL: string): Promise<postI[]> => {
        const post = await fetch(apiURL);
        if (!post.ok) {
            throw new FetchError('Cannot get posts from API');
        }
        return post.json();
    };

    // Add all posts created by user to its object
    private addPostsToUser = (users: userI[], userId: number, postsToAdd: postI[]): void => {
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
            newArray.push([]);
        }
        return newArray;
    };

    // If parameter is null or undefined throw error
    private static checkParameters(users: userI[]) {
        if (users === undefined || users === null) throw new TypeError('Invalid data - users were not found.');
    }

    // Check if fetched posts have all required fields. Lack of at least one field can mean that it is error in API url.
    private static checkFetchedPosts(posts: postI[]): void {
        for (const post of posts) {
            if (!(post && post.title && post.userId && post.body && post.id))
                throw new FetchError('Posts fetched from the API do not meet the requirements');
        }
    }

    // Check if fetched posts have all required fields. Lack of at least one field can mean that it is error in API url.
    private static checkFetchedUsers(users: userI[]): void {
        for (const user of users) {
            if (!(user && user.id && user.name && user.email && user.address && user.phone && user.website && user.company))
                throw new FetchError('Users fetched from the API do not meet the requirements');
        }
    }
}