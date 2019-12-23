//import express module
import express = require('express')
import { MetricsHandler } from './metrics'
import path = require('path')
import bodyparser = require('body-parser')

//FOR SESSION 
import session = require('express-session')
import levelSession = require('level-session-store')

//create a server
const app = express()
const port: string = process.env.PORT || '8082'

app.use(express.static(path.join(__dirname, '/../public'))) 

app.set('views', __dirname + "/../view");
app.set('view engine', 'ejs');

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({"extended": false}))



/* Session */

//create a level store
const LevelStore = levelSession(session)

app.use(session({
    secret: 'my very secret phrase',
    store: new LevelStore('./db/sessions'),
    resave: true,
    saveUninitialized: true
}))

//route 1
// app.get('/', (req: any, res: any) => {
//     res.write('Hello world')
//     res.end()
// })

//route 2
app.get(
    '/hello/:name', 
    (req, res) => res.render('hello.ejs', {name: req.params.name})
)

//declare a instance of MetricsHandler
const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')

//route 3 : write metrics (key, value) in db
app.post('/metrics/:id', (req: any, res: any) => {
    dbMet.save(req.params.id, req.body, (err: Error | null) => {
        if (err) throw err
        res.status(200).send("Ya qqch")
    })
})

//route 4 : get all metrics
app.get('/metrics/', (req: any, res: any) => {
    dbMet.getAll(
        (err: Error | null, result: any) => {
            if(err) throw err    
            res.status(200).send(result)
        }
    )
})

//route 5 : get metrics from id
app.get('/metrics/:id', (req: any, res: any) => {
    dbMet.getOne(req.params.id, (err: Error | null, result: any) => {
        if(err) throw err
        res.status(200).send(result)
        console.log(result)
        //res.render('index', { name: req.session.username })
        }
    )
})

/* DELETE */

//route 6 : delete one metric from an ID
app.delete('/metrics/:id/:timestamp', (req: any, res: any) => {
    dbMet.deleteOneFromID(req.params.id, req.params.timestamp, (err: Error | null, result: any) => {
            if(err) throw err
            res.status(200).send(result)
            dbMet.delete(result, req.params.id)
        }
    )
})

//route 7 : delete metrics of user
app.delete('/metrics/:id', (req: any, res: any) => {
    dbMet.deleteAllFromID(req.params.id, (err: Error | null, result: any) => {
            if(err) throw err
            res.status(200).send(result)
            dbMet.delete(result, req.params.id)
        }
    )
})

/* Listener */
const authCheck = function (req: any, res: any, next: any) {
    if (req.session.loggedIn) {
      next()
    } else res.redirect('/login')
}
  
app.get('/', authCheck, (req: any, res: any) => {
    res.render('index', { name: req.session.username })
})


app.listen(port, (err: Error) => {
    if (err) {
        throw err
    }
    console.log(`server is listening on port ${port}`)
})


 /* Users Authentification*/
import { UserHandler, User } from './user'
const dbUser: UserHandler = new UserHandler('./db/users')
const authRouter = express.Router()

authRouter.get('/login', (req: any, res: any) => {
    res.render('login')
})
  
authRouter.get('/signup', (req: any, res: any) => {
    res.render('signup')
})


authRouter.get('/logout', (req: any, res: any) => {
    delete req.session.loggedIn
    delete req.session.user
    res.redirect('/login')
})


app.post('/login', (req: any, res: any, next: any) => {
    //search for the user
    dbUser.get(req.body.username, (err: Error | null, result?: User) => {
        //if not found error
        if (err) next(err)
        //if undefined not found
        if (result === undefined || !result.validatePassword(req.body.password)) {
        res.redirect('/login')
        //user found
        } else {
            req.session.loggedIn = true
            req.session.user = result
            res.redirect('/')
        }
    })
})


app.post('/signup', (req: any, res: any, next: any) => {
    var newUser = new User(req.body.username, req.body.email, req.body.password)

    //retrieve all users in the database
    dbUser.getAll((err: Error | null, result: User[]) => {
        if(err) throw err
       
        // search if the information in the sign up form doesn't already exist 
        let exist = dbUser.checkUserExist(result, req.body.username, req.body.email,
            (exist: false | true) => {
                //if already exist redirect to login form
                if(exist === true){
                    res.redirect('/login')
                }
                //if not save it in the database
                else if(exist === false){
                    console.log("save user")
                    dbUser.save(newUser, (err: Error | null) =>  {
                        if(err) res.redirect('/signup')

                        req.session.loggedIn = true
                        req.session.user = newUser
                        res.redirect('/')  

                        console.log(req.session.user)
                        console.log("balba")     
                    })
                }
            })

            // if(ok === true){
            //     console.log("ok=true")
            //     req.session.loggedIn = true
            //     req.session.user = newUser
            //     res.redirect('/')  

            //     console.log(req.session.user)
            // }
            
    })
})

app.get('/users', (req: any, res: any, next: any) => {
    //retrieve all users in the database
    dbUser.getAll(
        (err: Error | null, result: any) => {
            if(err) throw err
            res.status(200).send(result)
    })
})

app.delete('/users', (req: any, res: any, next: any) => {
    //retrieve all users in the database
    dbUser.deleteAll()
    res.status(200).send("delete ok")
})


/* Athentification Route */
app.use(authRouter)
const userRouter = express.Router()

userRouter.post('/', (req: any, res: any, next: any) => {
    dbUser.get(req.body.username, function (err: Error | null, result?: User) {
        if (!err || result !== undefined) {
            res.status(409).send("user already exists")
        } else {
            dbUser.save(req.body, function (err: Error | null) {

            if (err) next(err)

            else res.status(201).send("user persisted")
            })
        }
    })
})

userRouter.get('/:username', (req: any, res: any, next: any) => {
    dbUser.get(req.params.username, function (err: Error | null, result?: User) {
        if (err || result === undefined) {
            res.status(404).send("user not found")
        } else res.status(200).json(result)
    })
})

app.use('/user', userRouter)
