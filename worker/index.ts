import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

import { calculateAverage, downloadFileAndSaveToTemp } from './utils';
import { recieveTaskFromSQS } from './recieveTaskFromSQS';
import {sendResultToSQS} from './sendResultToSQS'
dotenv.config();

const app: Express = express();
const port = 1234;

const cors = require('cors');
app.use(cors({
    origin: ['http://localhost:8000','http://localhost:3000']
}));
app.use(express.json()) 

export type TaskStatus = "WAITING" | "RUNNING" | "COMPLETED" | "BLOCKED" | "ABORTED"


// Change the status to support all the following status
var currentTask = '';
var isBusy = false;
var lastTaskMessageID = '';


// Create a handler to cancel the task if the user cancels it
// Use a global variable to cancel the task in between the pipeline
setInterval(() => !isBusy && recieveTaskFromSQS()
        .then((filePath) => {
            currentTask = filePath as string;
            isBusy =true
            return downloadFileAndSaveToTemp("http://host.docker.internal:8000/getFile", filePath as string)})
        .then(() => calculateAverage())
        .then(({average,currentCount}) => sendResultToSQS(JSON.stringify({average,currentCount,currentTask})))
        .then((message)=>{
            lastTaskMessageID = message as string
            isBusy =false;
            currentTask = '';
        })
, 12000);


app.post('/downloadfile', async (req: Request, res: Response) => {
    await downloadFileAndSaveToTemp(req.body.url, req.body.filePath);
    res.json({
        sucess: true
    })
});

app.get('/average', async (req: Request, res: Response) => {
    let data = await calculateAverage();
    res.json({
        average: data.average,
        count: data.currentCount
    });
});

app.get('/', (req: Request, res: Response) => {
    res.send('Distributed Computing Worker Node Server. A Python process can be spawned in this node');
});


app.get('/status', function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Credentials' : 'true'
    })
    status(res)
})

function status(res: Response) {
    let id = `id: ${Date.now()}`;
    var data  = JSON.stringify({currentTask,isBusy,lastTaskMessageID})
    console.log("Sending server status")
    res.write(`event:message\nid: ${id}\ndata: ${data} \n\n`)
    setTimeout(() => status(res), 5000)
}

app.listen(port, () => {
    console.log(`Started server at port ${port}`);
});
