//import classes
import { UserHandler } from "../src/user"
import { User } from "../src/user"
import { MetricsHandler, Metric } from '../src/metrics'

function populate(){
    const dbUser: UserHandler = new UserHandler('./db/users')
    const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')

    //Delete users
    dbUser.deleteAll()

    //Delete metrics
    dbUser.getAll((err: Error | null, result: any) => {
        if(err) throw err

        result.forEach((user : User) => {
            dbMet.deleteAllFromID(user.username, (err: Error | null, result2: any) => {
                if(err) throw err
                dbMet.delete(result2, user.username, () => {
                    //nothing to do here
                })
            })
        })
    })
    
    //Add 2 users
    var user1 = new User("Barbaraaa", "barbara.germaneau@edu.ece.fr", "aaaa")
    var user2 = new User("Cynaye", "cynthia.quaye@edu.ece.fr", "bbbb")
    var user3 = new User("Kim", "kim@gmail.com", "kkkk")


    var users = [user1, user2, user3]

    users.forEach((user: User) => {
        dbUser.save(user, (err: Error | null) => {
            if(err) console.log("can't save user1 when populate")
        })
    })

    //Add metrics for users
    var metrics1 : Metric[] = [
        new Metric("1384686660000", 10), 
        new Metric("138468666001", 12),
        new Metric("138468666002", 13)
    ]

    var metrics2 : Metric[] = [
        new Metric("1384686660004", 8), 
        new Metric("138468666005", 15),
        new Metric("138468666006", 12),
        new Metric("138468666007", 11)
    ]

    var metrics3 : Metric[] = [
        new Metric("1384686660008", 16), 
        new Metric("138468666009", 14),
        new Metric("1384686660010", 19)
    ]

    dbMet.save("Barbaraaa", metrics1, (err: Error | null) => {
        if (err) console.log("can't save metrics when populate (user: Barbaraaa)")
    })
    dbMet.save("Cynaye", metrics2, (err: Error | null) => {
        if (err) console.log("can't save metrics when populate (user: Cynaye)")
    })
    dbMet.save("Kim", metrics3, (err: Error | null) => {
        if (err) console.log("can't save metrics when populate (user: Kim)")
    })   
    
}

populate()
