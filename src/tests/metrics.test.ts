import { expect } from 'chai'
import { Metric, MetricsHandler } from '../metrics'
import { LevelDB } from "../leveldb"

const dbPath: string = 'db_test'
var dbMet: MetricsHandler

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
            //test on getOne function when clean the db, use id "0"
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

    //'#save' should save data
    describe('#save', function () {
        it('should save data', function (next) {
            //we will test with these metrics
            let metricOne : Metric = new Metric("1384686660000", 10)
            let metricTwo : Metric = new Metric("1384686660001", 12)
            let metrics : Metric[] = [metricOne, metricTwo]

            //test on save function when save new metric(s) to database
            dbMet.save("1", metrics, function (err: Error | null) {
                if (err) throw err
                //test on getOne function to see if the metric(s) have been saved
                dbMet.getOne("1", function (err: Error | null, result: Metric[]) {
                    //expect error to be null
                    expect(err).to.be.null
                    //expect result not to be undefined
                    expect(result).to.not.be.undefined
                    //expect result not to be null
                    expect(result).to.not.be.null
                    //Expext result not to be empty
                    expect(result).to.not.be.empty
                    //expect result size to be 2
                    expect(result).to.have.lengthOf(2);
                    //expect result to have coherent value and timestamp fpr index 0 and 1
                    expect(result[0].value).to.equal(10)
                    expect(result[0].timestamp).to.equal("1384686660000")
                    expect(result[1].value).to.equal(12)
                    expect(result[1].timestamp).to.equal("1384686660001")
                    next()
                })
            })
        })
    })

    //'#update' should update existing data
    describe('#update', function () {
        it('should update data', function (next) {
            //test on update and getOne functions when update a metric value, new value should be 41
            dbMet.update("1", "1384686660000", 41, function (err: Error | null) {
                if (err) throw err

                dbMet.getOne("1", function (err: Error | null, result: Metric[]) {
                    //expect result to be null
                    expect(err).to.be.null
                    //expect result not to be undefined
                    expect(result).to.not.be.undefined
                    //expect result not to be empty
                    expect(result).to.not.be.empty
                    //expect result size to be 2
                    expect(result).to.have.lengthOf(2);
                    //expect result to have coherent value and timestamp fpr index 0 and 1
                    expect(result[0].value).to.equal(41)
                    expect(result[0].timestamp).to.equal("1384686660000")
                    expect(result[1].value).to.equal(12)
                    expect(result[1].timestamp).to.equal("1384686660001")

                    next()
                })
            })
        })
    })

    //'#delete' should delete data
    describe('#delete', function () {
        it('should delete data', function (done) {
            //we will test with these metrics
            let timestamp : string = "1384686660000"

            dbMet.deleteOneFromID("1", timestamp, function (err: Error | null, result: Metric[]) {
                if(err) throw err
                dbMet.delete(result, "1", function(){
                    //get all metrics of id =1
                    dbMet.getOne("1", function (err: Error | null, result2: Metric[]) {
                        console.log(result2.length)
                        //expect result to be null
                        expect(err).to.be.null
                        //expect result not to be empty
                        expect(result2).to.not.be.empty
                        //expect length to be equal at zero because we deleted the only metric existing
                        expect(result2).to.have.lengthOf(1);
                        //expect result to have coherent value and timestamp
                        expect(result2[0].value).to.equal(12)
                        expect(result2[0].timestamp).to.equal("1384686660001")
                        done()
                    })
                })
            })
        })
    })
    
    // '#delete' should not fail if data does not exist
    describe('#delete', function () {
        it('should not fail if data does not exist', function (done) {
            //we will test with this timestamp
            let timestamp : string = "1384686660002"

            dbMet.deleteOneFromID("1", timestamp, function (err: Error | null, result: Metric[]) {
                if(err) throw err
                dbMet.delete(result, "1", function(){
                    //get all metrics of id =1
                    dbMet.getOne("1", function (err: Error | null, result2: Metric[]) {
                        //expect result to be null
                        expect(err).to.be.null
                        //expect result not to be empty, still one metric inside
                        expect(result2).to.not.be.empty
                        //expect length to be equal at one because there is still one metric
                        expect(result2).to.have.lengthOf(1);
                        //expect result to have coherent value and timestamp, the delete didn't affect the metric(s)
                        expect(result2[0].value).to.equal(12)
                        expect(result2[0].timestamp).to.equal("1384686660001")

                        done()
                    })
                })
            })
        })
    })


})