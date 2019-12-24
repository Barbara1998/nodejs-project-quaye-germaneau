import { LevelDB } from "./leveldb"
import WriteStream from 'level-ws'

export class User {
    public username: string
    public email: string
    private password: string = ""
  
    constructor(username: string, email: string, password: string, passwordHashed: boolean = false) {
        this.username = username
        this.email = email

        if (!passwordHashed) {

            this.setPassword(password)
        } else this.password = password
    }
    
    static fromDb(username: string, value: any): User {
        const [password, email] = value.split(":")
        return new User(username, email, password)
    }
    
    public setPassword(toSet: string): void {
        // Hash and set password
        this.password = toSet
    }
    
    public getPassword(): string {
        return this.password
    }
    
    public validatePassword(toValidate: String): boolean {
        // return comparison with hashed password
        if(toValidate ===  this.getPassword())
            return true
        else return false
    }
}

export class UserHandler {
    public db: any

    constructor(path: string) {
        this.db = LevelDB.open(path)
    }
  
    public closeDB(){
        this.db.close();
    }

    //save a new user the user's database
    public save(user: User, callback: (err: Error | null) => void) {
        this.db.put(`user:${user.username}`, `${user.getPassword()}:${user.email}`, (err: Error | null) => {
            callback(err)
        })
    }

    //get one specific user
    public get(username: string, callback: (err: Error | null, result?: User) => void) {
        //use database function get : key / value
        //fetch user by his username (=key)
        this.db.get(`user:${username}`, function (err: Error, data: any) {
            //return error like key not found
            if (err) callback(err)
            //(password:email)=value is undefined
            else if (data === undefined) callback(null, data)
            //username found => create a user
            callback(null, User.fromDb(username, data))
        })
    }

    //get all the users
    public getAll(
        callback : (error: Error | null, result : any | null) => void
    ) {
        let users : User[] = []
        //open up a readable stream
        this.db.createReadStream()
            //listen to the stream's 'data' event
            .on('data', function (data) {
                //retrieve username, password and email
                let username : string = data.key
                const [password, email] = data.value.split(":")
                let user = new User(username, email, password)
                //all the users are in
                users.push(user)
            })
            .on('error', function (err) {
                console.log('Oh my!', err)
                callback(null, err)
            })
            .on('close', function () {
                console.log('Stream closed')
            })
            .on('end', function () {
                //send back all the metrics
                callback(null, users)
                console.log('Stream ended')
            })
    }

    //check if user exists in database, for sign up
    public checkUserExist(users : User[], username: string, email: string,
        callback : (exist: false | true) => void
    ){
        if(users.length === 0){
            callback(false)
        }
        
        else{
            users.forEach((user: User) => {
                if(user.email === email || user.username === username)
                    callback(true)
                //user doesn't exist yet
                else callback(false)
            })
        }
    }

    //Delete all users
    public deleteAll(){

        this.getAll(
            (err: Error | null, result: any) => {
                if(err) throw err
                result.forEach((user : User) => {
                    this.db.del("user:"+user.username)
                })
            })
    }

    //Delete one user
    public delete(username: string, callback: (err: Error | null) => void) {
        this.db.del("user:"+username, function(err : Error | null) {
            callback(err)
        })
    }
  
}