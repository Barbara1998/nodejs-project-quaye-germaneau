# nodejs-project-quaye-germaneau

> Nodejs & DevOps projects ING4    

# Table of Content
<details><summary>Click to expand</summary>

- [Description](#description)
- [Installation](#installation)
- [Supported Platforms](#supported-platforms)
- [Usage Instruction](#usage)
- [Tests](#tests)
- [Contributors](#contributing)

</details>

# Description
The project is a simple web API with a dashboard that allow user to :
* API side 
  - CRUD users 
  - Authenticate
  - CRUD your own metrics (make use of an authorization middleware)
* Front side
  - Home page
  - Sign In / Sign Up / Sign Out
  - Insert/update/delete metrics once logged in
  - Retrieve the user’s metrics and display it in a graph
  - Only access the user’s metrics, not the other ones
* Utils 
  - pre-populate the database with at least two users and their own metrics   

* Tests
  - use of Mocha and Chai
  - Travis CI

# Installation
After downloadinf or cloning our repository open it in a code editing platform open your terminal and execute the following command in this specific order : 

1. Install node modules and dependencies : `npm install`      
2. Populate the database : `npm run populate`   
3. Run tests : `npm run test`     
4. Run the application : `npm run dev` or `npm run start`

# Supported Platforms
This project has been developped only using a Windows operating system, it is recommanded to run the project on Windows (it may not work same on Mac or Linux, never tried).    

# Usage Instructions
We will explain here all the possible routes and their purpose.    

### Handle Metrics

* POST method using url `/metrics/:id` : used to **write** metrics(key, value), for a specifi user, in the database.   
* POST method using url `/metrics/:id/:timestamp` : used to **update** the value of one user's mertric    
* GET method using url `/metrics/` : used to get all metrics of **all** users (not used in the application)   
* GET method using url `/metrics/:id` : used to get all metrics of **one** user    
* DELETE method using url `/metrics/:id/:timestamp`: used to delete **one** metric of **one** user   
* DELETE method using url `/metrics/:id` : used to delete **all** metrics of **one** user   

### Handle Users
* GET method using `/users` : used to **retrieve all the users** in the database (not used in the app but used for development and the tests)
* DELETE method using `/users`: used to **delete all the users** in the database (not used in the app but used for development too)
* DELETE method using `/users/:id` : used to **delete one user** (not used in the app too but could be usefull)

### Handle Front side
* GET method using url `/login`: used to render the **login page**
* GET method using url `signup` : used to render the **signup page**
* GET method using url `/logout` : used to **logout a user from his session** and **redirect to the login page**    
* POST method using url `/login` : used to **handle the connexion** when a user wants to login, perform verification of identifiers and redirect either to login page or home page of the dashboard application   
* POST methos using `/signup`: used to **handle the registration** of a new user, perform verification on identifiers to see if already exist or not and redirect either to login page or home page of the app   

# Tests
For the test we created a specific folder : **/src/tests**. In this folder there are two files, one for the tests on the metrics and the other for tests on the users.    

### Tests on metrics
* Test to get one metric while the database is empty      
* Test to save two metrics (belong to the same user) in the database    
* Test to update the value of one of the metrics     
* Test to delete one of the metrics     
* Test to delete a metric that doen't exist in the database    

### Test on users
* Test to get all the users while the database is empty      
* Test to save one user   
* Test to delete the user from the database   

# Contributors
This project has been realised by Quaye Cynthia and Germaneau Barbara.  
> TD01 SI inter PROMO 2021 