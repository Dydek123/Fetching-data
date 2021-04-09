# OpenX - recruitment task version 2
The application gets posts and user data from a given APIs ([users API](https://jsonplaceholder.typicode.com/users), [posts API](https://jsonplaceholder.typicode.com/posts)) and then performs the appropriate [actions](#features).

## Table of contents
* [Technologies](#technologies)
* [Setup](#setup)
* [Features](#features)

## Technologies
* TypeScript 4.2
* Jest 26.6

## Setup
Build program
```
 $ npm run-script build
```

Run program
```
 $ npm run 
```

Run tests
```
 $ npm test
```

Run program in development mode
```
 $ npm run dev
```

## Features
* Count how many posts were created by each user
* Check that the titles are unique and show the ones that are not unique
* For each user, show another user who lives closest to him