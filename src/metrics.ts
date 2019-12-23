//not good
//import LevelDB = require('./leveldb')
//this.db = LevelDB.open(dbPath) : error on open solution:
import {LevelDB} from './leveldb'
import WriteStream from 'level-ws'

export class Metric {
    public timestamp: string
    public value: number
  
    constructor(ts: string, v: number) {
      this.timestamp = ts
      this.value = v
    }
  }
  
export class MetricsHandler {
    private db: any 

    constructor(dbPath: string) {
        //open database
        this.db = LevelDB.open(dbPath)
    }

    public closeDB(){
        this.db.close();
    }

    //note for us: on a changé le type de id en string au lieu de number
    public save(id: string, metrics: Metric[], callback: (error: Error | null) => void) {
        //stream that writes on the db
        console.log(id + metrics)
        const stream = WriteStream(this.db)
        stream.on('error', callback)
        stream.on('close', callback)
        metrics.forEach((m: Metric) => {
            stream.write({ key: `metric:${id}:${m.timestamp}`, value: m.value })
            console.log(`metric:${id}:${m.timestamp}`)
        })
        stream.end()
    }

    //get all metrics
    public getAll(
        callback : (error: Error | null, result : any | null) => void
    ) {
        let metrics : Metric[] = []
        //open up a readable stream
        this.db.createReadStream()
            //listen to the stream's 'data' event
            .on('data', function (data) {
                //retrieve the "3rd" part of the key
                let timestamp : string = data.key.split(':')[2]
                let metric : Metric = new Metric( timestamp, data.value)
                console.log("timestamp="+ metric.timestamp);
                console.log("value="+ metric.value);

                //all the metrics are in
                metrics.push(metric)
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
                callback(null, metrics)
                console.log('Stream ended')
            })
        }

    
    //get one metric
    //compare id from the request
    public getOne(
        id: string,
        callback : (error: Error | null, result : any | null) => void
    ) {
        let metrics : Metric[] = []
        //open up a readable stream
        this.db.createReadStream()
        .on('data', function (data) {
            //take the "2nd" part of the key ==> id
            let user: string = data.key.split(':')[1]
            //compare here with the id
            if(id == user){
                let timestamp : string = data.key.split(':')[2]
                let metric : Metric = new Metric( timestamp, data.value)
                metrics.push(metric)
            }        
        })
        // This catches any errors that happen while creating the readable stream
        .on('error', function (err) {
            console.log('Oh my!', err)
            callback(null, err)
        })
        .on('close', function () {
            console.log('Stream closed')
        })
        .on('end', function () {
            //send back the metrics that correspond to the id in the url
            callback(null, metrics)
            console.log('Stream ended')
        })
    }

    //delete one metric from an ID
    public deleteOneFromID(
        id: string,
        timestamp : string,
        callback : (error: Error | null, result : any | null) => void
    ) {
        let metrics : Metric[] = []
        //open up a readable stream
        this.db.createReadStream()
        .on('data', function (data) {
            let tempKey : string = `metric:${id}:${timestamp}`
            //look for the right key from the metric we want to delete
            if(data.key == tempKey){
                console.log(`metric:${id}:${timestamp}`)
                let metric : Metric = new Metric( timestamp, data.value)
                metrics.push(metric)
            }
        })
        // This catches any errors that happen while creating the readable stream
        .on('error', function (err) {
            console.log('Oh my!', err)
            callback(null, err)
        })
        .on('close', function () {
            console.log('Stream closed')
        })
        .on('end', function () {
            //send back the metrics that correspond to the id in the url
            callback(null, metrics)
            console.log('Stream ended')
        })
    }

    
    //delete all metric from an ID
    public deleteAllFromID(
        id: string,
        callback : (error: Error | null, result : any | null) => void
    ) {
        let metrics : Metric[] = []
        //open up a readable stream
        this.db.createReadStream()
        .on('data', function (data) {

            let tempID: string = data.key.split(':')[1]
            //compare here with the id
            if(id == tempID){
                let timestamp : string = data.key.split(':')[2]
                let metric : Metric = new Metric( timestamp, data.value)
                metrics.push(metric)
            }
        })
        // This catches any errors that happen while creating the readable stream
        .on('error', function (err) {
            console.log('Oh my!', err)
            callback(null, err)
        })
        .on('close', function () {
            console.log('Stream closed')
        })
        .on('end', function () {
            //send back the metrics that correspond to the id in the url
            callback(null, metrics)
            console.log('Stream ended')
        })
    }

    //delete in the db
    public delete(metrics: Metric[], id: string){
        //for each metric we recreate the key to identify the metric to delete
        metrics.forEach( (metric: Metric) => {
            let tempKey : string = `metric:${id}:${metric.timestamp}`
            this.db.del(tempKey)
        })
    }

}