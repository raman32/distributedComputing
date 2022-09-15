import express, {Express, Request, Response} from 'express';
import {generateMFileWithRandomNumbers} from './generateRandomNumbers';
import {sendTaskToSQS} from './sendTaskToSQS';
import dotenv from 'dotenv';
import { SERVERS } from './const';
import { recieveResultsFromSQS } from './recieveResultsFromSQS';

dotenv.config();

const app:Express = express();
const port = process.env.PORT;

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(express.json());


// STATES OF THE CURRENT TASKS
// A better version of these task would be to create a map of tasks and function which will be 
// used to calculate the aggregate.
var currentRunningTask :string[]  = [];
var currentAggregatedResults : {"average":number,"currentCount":number,"currentTask":string}[]  = [];

// FOR TESTING PURPOSE ONLY
app.get('/',(req: Request,res: Response)=> {
    res.send('Distributed Computing Api Server.');
});

// Generates M Random File 
app.get('/generateRandomFile',(req: Request,res: Response)=> {
    var numberOfFiles = 10;
    if(req.query.numberOfFiles) {
    numberOfFiles = parseInt(req.query.numberOfFiles as string);
    }
    if(numberOfFiles > 50) {
        res.send('Error too many files to handle')
        return;
    }
    let fileDirectory  = generateMFileWithRandomNumbers(numberOfFiles,100000,1000000);
    var filePaths = [];
    for (let index = 0; index < numberOfFiles; index++) {
        filePaths.push(`./${fileDirectory}/${index}.csv`);
    }
    res.json({
        numberOfFiles: numberOfFiles,
        filePaths: filePaths,
    });
});

// Endpoint to get the file
app.post('/getFile',(req: Request,res:Response) => {
    // Since ts is compile inside the dist folder we go to the parent directory
    res.sendFile(req.body.filePath as string,{root:__dirname+"/.."});
})

// Function to poll the result queue.
// TODO: fix the setTimeout to only trigger at a fixed interval using a global variable.
async function pollMessageForTheresult ({ filePath }: { filePath: string; }) {
    let result  = await recieveResultsFromSQS().then(data=>JSON.parse(data as string));
    currentAggregatedResults.push(result);
    if(filePath in currentAggregatedResults.map((ele)=>ele.currentTask)) {
        return;
    }else {
        setTimeout(()=>pollMessageForTheresult({ filePath }),12000)
        return;
    }
}

// Function to send an individual task to SQS
app.post('/sendTaskToSQS',async (req:Request,res:Response) => {
    currentRunningTask.push(req.body.filePath)
    let messageID  = await sendTaskToSQS(req.body.filePath);
    res.json({
        status: true,
        messageID: messageID
    })
    pollMessageForTheresult({ filePath: req.body.filePath });
})


// THIS IS THE REDUCE FUNCTION (COULD BE PASSED FROM THE USER)
app.post('/getAverage',async (req:Request,res:Response) => {
    let result  = currentAggregatedResults.reduce((prev,curr)=>(
        {
            "average" :(prev.average*prev.currentCount + curr.average*curr.currentCount)/(prev.currentCount +curr.currentCount),
            "currentCount": (prev.currentCount +curr.currentCount)
        }
        ),{"average": 0 , "currentCount": 0});
    res.json(result)
})

app.post('/clearTasks',(req:Request,res:Response) => {
    currentRunningTask = [];
    currentAggregatedResults = [];
    res.json({
        success:true
    })
})

app.post('/listCompleletedTasks',(req:Request,res:Response) => {
    res.json({
        currentAggregatedResults
    })
})


// Sends a group of task to SQS
// TODO: Implement Group ID in SQS. Use FIFO SQS with multiple group to recognize individual batch.
// Recognize each group with unique ID which can be used for filtering by worker nodes.
app.post('/sendGroupTaskToSQS',async (req:Request,res:Response) => {
    let filePaths = req.body.filePaths;
    let messageIDs: string[] = [];
    filePaths.forEach(async (filePath:string)=>{
        let messageID  = await sendTaskToSQS(filePath);
        messageIDs.push(messageID as string);
        currentRunningTask.push(filePath)
    })
    res.json({
        status: true,
        messageID: messageIDs
    })
})



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
    var data  = JSON.stringify({currentRunningTask,currentAggregatedResults})
    console.log("Sending server status")
    res.write(`event:message\nid: ${id}\ndata: ${data} \n\n`)
    setTimeout(() => status(res), 5000)
}



// Sends the server info
app.post('/getServerInfo',(req:Request,res:Response) => {
   res.json(SERVERS);
})

app.listen(port,() => {
    console.log(`Started server at port ${port}`);
});
