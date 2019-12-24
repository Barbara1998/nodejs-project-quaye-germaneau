import { expect } from 'chai'
import { User, UserHandler } from '../user'
import { LevelDB } from "../leveldb"

const dbPath: string = 'db_test'
var dbUser: UserHandler

describe('Users', function () {
    before(function () {
        //clear database
        LevelDB.clear(dbPath)
        dbUser = new UserHandler(dbPath)
    })

    after(function () {
        dbUser.closeDB()
    })

    // Describe the getAll method
    describe('#getAll', function () {
        it('should get empty array on non existing group', function () {

            dbUser.getAll((err: Error | null, result: User[]) => {
                //expect result to be null
                expect(err).to.be.null
                //expect result to be undefined
                expect(result).to.be.empty
            })
        })
    })

    //'#save' should save users
    describe('#save', function () {
        it('should save users', function (done) {
            // user we will save
            let userOne : User = new User("Tomy", "tomy@gmail.com", "1234")
            // call save user method
            dbUser.save(userOne, (err: Error | null) => {
                // then call get user to see if he has been saved
                dbUser.get(userOne.username, (err : Error | null, result?: User) => {
                    // expect err to be null
                    expect(err).to.be.null
                    // expect result not to be nudefined
                    expect(result).to.not.be.undefined
                    // expect result to have coherent value
                    if(result){
                        expect(result.username).to.equal("Tomy")
                        expect(result.email).to.equal("tomy@gmail.com")
                        expect(result.getPassword()).to.equal("1234")
                    }
                    done()
                })
            })
            
        })
    })

    // '#delete' should delete user
    describe('#delete', function () {
        it('should delete user', function (done) {
            // we will test with this username
            let username : string = "Tomy"

            dbUser.delete(username, function (err: Error | null) {
                if(err) throw err
                // retrieve all users, should left 0 users because we saved only one
                dbUser.getAll((err: Error |  null, result?: User) => {
                    // expect err to be null
                    expect(err).to.be.null
                    // expect result to have a size of zero because we deleted the only user in the db
                    expect(result).to.have.lengthOf(0);
                    // expect result to be empty
                    expect(result).to.be.empty
                    done()
                })
            })
        })
    })


})