import Task from "../../search";
import mockUsers from "../mocks/mockUsers"
import mockPosts from "../mocks/mockPosts";
import mockSinglePost from "../mocks/mockSinglePost";
import mockSingleUser from "../mocks/mockSingleUser";

const task = new Task();

beforeEach(() => {
    //Clear user posts
    for (const mockUser of mockUsers) {
        mockUser.posts = [];
    }
    mockSingleUser.posts = [];
})

test('should not throw any errors while fetching data with valid URLs', async () => {
    const userAPI: string = 'https://jsonplaceholder.typicode.com/users';
    const postsAPI: string = 'https://jsonplaceholder.typicode.com/posts';
    try {
        await task.fetchData(userAPI, postsAPI);
    } catch (e) {
        expect(e.message).toEqual('Cannot get posts from API')
        expect(e.name).toEqual('Fetch Error')
    }
});

test('should throw an error when fetching data with invalid URL', async () => {
    let userAPI: string;
    let postsAPI: string;
    try {
        userAPI = 'https://jsonplaceholder.typicode.com/users';
        postsAPI = 'https://jsonplaceholder.typicode.com/incorrectURL'; // Incorrect url
        await task.fetchData(userAPI, postsAPI);
    } catch (e) {
        expect(e.message).toEqual('Cannot get posts from API')
        expect(e.name).toEqual('Fetch Error')
    }

    try {
        userAPI = 'https://jsonplaceholder.typicode.com/incorrectURL'; // Incorrect url
        postsAPI = 'https://jsonplaceholder.typicode.com/posts';
        await task.fetchData(userAPI, postsAPI);
    } catch (e) {
        expect(e.message).toEqual('Cannot get users from API')
        expect(e.name).toEqual('Fetch Error')
    }
});

test('should throw an error when fetching data with both invalid URLs', async () => {
    let userAPI: string;
    let postsAPI: string;
    try {
        userAPI = 'https://jsonplaceholder.typicode.com/incorrectURL'; // Incorrect url
        postsAPI = 'https://jsonplaceholder.typicode.com/incorrectURL'; // Incorrect url
        await task.fetchData(userAPI, postsAPI);
    } catch (e) {
        expect(e.message).toEqual('Cannot get posts from API')
        expect(e.name).toEqual('Fetch Error')
    }
});

test('should throw an error when getting data from another user API', async () => {
    let userAPI: string;
    let postsAPI: string;
    try {
        userAPI = 'https://jsonplaceholder.typicode.com/todos'; // Todos API instead of user API
        postsAPI = 'https://jsonplaceholder.typicode.com/posts';
        await task.fetchData(userAPI, postsAPI);
    } catch (e) {
        expect(e.message).toEqual('Users fetched from the API do not meet the requirements')
        expect(e.name).toEqual('Fetch Error')
    }
});
test('should throw an error when getting data from another posts API', async () => {
    let userAPI: string;
    let postsAPI: string;
    try {
        userAPI = 'https://jsonplaceholder.typicode.com/users';
        postsAPI = 'https://jsonplaceholder.typicode.com/todos';// Todos API instead of posts API
        await task.fetchData(userAPI, postsAPI);
    } catch (e) {
        expect(e.message).toEqual('Posts fetched from the API do not meet the requirements')
        expect(e.name).toEqual('Fetch Error')
    }
});

test('should count posts for each user', () => {
    mockUsers[0].posts = mockPosts; // Add 3 posts to first user
    mockUsers[1].posts = [mockSinglePost] // Add 1 post to second user
    const expectedResult: string[] = [
        `${mockUsers[0].username} napisał(a) ${mockPosts.length} postów`,
        `${mockUsers[1].username} napisał(a) 1 postów`,
        `${mockUsers[2].username} napisał(a) 0 postów`
    ]
    expect(new Set(task.countUsersPosts(mockUsers))).toEqual(new Set(expectedResult));
})

test('should show 0 post when user has no post field', () => {
    const expectedResult: string[] = [`${mockSingleUser.username} napisał(a) 0 postów`];
    expect(new Set(task.countUsersPosts([mockSingleUser]))).toEqual(new Set(expectedResult));
})

test('should throw TypeError when undefined or null parameters', () => {
    expect(() => {task.countUsersPosts(undefined)}).toThrow(TypeError)
    expect(() => {task.countUsersPosts(null)}).toThrow(TypeError)
})

test('should return posts which are not unique', () => {
    mockUsers[0].posts = mockPosts;
    mockUsers[1].posts = mockPosts;
    mockUsers[1].posts.push(mockSinglePost); //Should not be included in final array
    const expectedResult: string[] = [];
    for (const mockPost of mockPosts)
        expectedResult.push(mockPost.title)
    expect(new Set(task.repeatedTitles(mockUsers))).toEqual(new Set(expectedResult));
})

test('should return post title only once, if title exist multiple time', () => {
    mockSingleUser.posts = [];
    for (let i = 0; i < 3; i++) //Add the same post 3 times
        mockSingleUser.posts.push(mockSinglePost);
    const expectedResult: string[] = [
        `${mockSinglePost.title}`
    ]
    expect(new Set(task.repeatedTitles([mockSingleUser]))).toEqual(new Set(expectedResult));
})

test('should return empty array when all posts have unique title', () => {
    mockUsers[1].posts = mockPosts;
    for (let i = 0; i < mockPosts.length; i++)
        mockUsers[1].posts[i].title += i; // Add a unique number to each title to make the title unique
    const expectedResult: string[] = []
    expect(new Set(task.repeatedTitles(mockUsers))).toEqual(new Set(expectedResult));
})

test('should return empty array when there is no posts', () => {
    const expectedResult: string[] = []
    // Mock users have no posts
    expect(new Set(task.repeatedTitles(mockUsers))).toEqual(new Set(expectedResult));
})

test('should throw TypeError when undefined or null parameters', () => {
    expect(() => {
        task.repeatedTitles(undefined)
    }).toThrow(TypeError)
    expect(() => {
        task.repeatedTitles(null)
    }).toThrow(TypeError)
})

test('for each user, should find another user who lives closest to him', () => {
    const expectedResult: string[] = [
        `Najbliżej użytkownika ${mockUsers[0].username} mieszka: ${mockUsers[1].username}`,
        `Najbliżej użytkownika ${mockUsers[1].username} mieszka: ${mockUsers[2].username}`,
        `Najbliżej użytkownika ${mockUsers[2].username} mieszka: ${mockUsers[1].username}`,
    ]
    expect(new Set(task.findClosestUser(mockUsers))).toEqual(new Set(expectedResult));
})

test('should return an empty array when there are less than 2 users', () => {
    expect(new Set(task.findClosestUser([mockSingleUser]))).toEqual(new Set([]));
})

test('should throw TypeError when undefined or null parameters', () => {
    expect(() => {
        task.findClosestUser(undefined)
    }).toThrow(TypeError)
    expect(() => {
        task.findClosestUser(null)
    }).toThrow(TypeError)
})