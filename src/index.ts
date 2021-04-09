import Task from "./search";
import userI from "./interfaces/userI";

const main = async () => {
    const task = new Task();
    const userAPI: string = 'https://jsonplaceholder.typicode.com/users'; // URL to user API
    const postsAPI: string = 'https://jsonplaceholder.typicode.com/posts'; // URL to posts API
    await task.fetchData(userAPI, postsAPI) // Get data from APIs
    const users: userI[] = task.getUsers(); // Get users to variable

    // Count how many posts were created by each user
    console.log(task.countUsersPosts(users));

    // Check that the titles are unique and show the ones that are not unique
    const repeatedTitles: string[] = task.repeatedTitles(users);
    console.log(repeatedTitles.length > 0 ? repeatedTitles : 'Tytuły są unikalne');

    // For each user, show another user who lives closest to him
    console.log(task.findClosestUser(users));
}

main()