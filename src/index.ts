import Task from "./search";

const task = async () => {
    const test = new Task();
    await test.fetchData()
    const users = test.getUsers();
    // console.log(users[9].posts.length)
    console.log(test.countUserPosts(users));
}

task()