import { expect } from 'chai'
import { Metric, MetricsHandler } from '../metrics'
import { LevelDB } from "../leveldb"

const dbPath: string = 'db_test'
var dbMet: MetricsHandler

const a: number = 0

describe('Metrics', function () {
    before(function () {
        //clear database
        LevelDB.clear(dbPath)
        dbMet = new MetricsHandler(dbPath)
    })

    after(function () {
        dbMet.closeDB()
    })

    //Describe the get method
    describe('#getOne', function () {
        it('should get empty array on non existing group', function () {
            //test on getOne function when clean the db
            dbMet.getOne("0", function (err: Error | null, result?: Metric[]) {
                //expect result to be null
                expect(err).to.be.null
                //expect result to be undefined
                expect(result).to.not.be.undefined
                //expect result to be empty
                expect(result).to.be.empty
            })
        })
    })

    //TEST SAVE

    //'#save' should save data
    describe('#save', function () {
        it('should save data', function () {
            //we will test with these metrics
            let metricOne : Metric = new Metric("1384686660000", 10)

            let metrics : Metric[] = [metricOne]

            //test on getOne function when clean the db
            dbMet.save("1", metrics, function (err: Error | null, result?: Metric[]) {

                //DO FOR GET ALL ???????????????????????????????
                dbMet.getOne("1", function (err: Error | null, result?: Metric[]) {
                    //expect result to be null
                    expect(err).to.be.null
                    //expect result to be undefined
                    expect(result).to.not.be.undefined
                    //expect result to be empty
                    //use a if in case that result is indefined => error otherrwise
                    //not very good ?????????????????????????????????????????
                    //test timstamp ????????????????????????????????????????????,
                    if(result)
                        expect(result[0].value).to.equal(10)
                })

            })
        })
    })


    //'#save' should update existing data


    //'#delete' should delete data
    describe('#delete', function () {
        it('should delete data', function (next) {
            //we will test with these metrics
            let timestamp : string = "1384686660000"
            // let metricOne : Metric = new Metric("1384686660000", 10)
            // let metrics : Metric[] = [metricOne]

            //test on getOne function when clean the db
            dbMet.deleteOneFromID("1", timestamp, function (err: Error | null, result?: Metric[]) {

                dbMet.getOne("1", function (err: Error | null, result?: Metric[]) {
                    console.log(result);
                    //expect result to be null
                    expect(err).to.be.null
                    //expect result to be undefined
                    expect(result).to.not.be.undefined
                    expect(result).to.be.empty

                    next()
                })

            })
        })
    })
    
    //'#delete' should not fail if data does not exist

    //TEST DELETE

})