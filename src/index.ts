import Task from "./search";

const task = async () => {
    const test = new Task();
    await test.fetchData()
    const users = test.getUsers();
    // console.log(users[9].address)
    // console.log(test.countUserPosts(users));
    // console.log(test.repeatedTitles(users));
    console.log(test.findClosestUser(users));
}

task()