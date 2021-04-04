import Task from "./search";

const task = async () => {
    const test = new Task();
    await test.fetchData()
}

task()