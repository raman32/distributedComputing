import express, {Express, Request, Response} from 'express';
import {generateMFileWithRandomNumbers} from './generateRandomNumbers';
import dotenv from 'dotenv';

dotenv.config();

const app:Express = express();
const port = process.env.PORT;

app.get('/',(req: Request,res: Response)=> {
    res.send('Distributed Computing Api Server.');
});

app.get('/generateRandomFile',(req: Request,res: Response)=> {
    var numberOfFiles = 10;
    if(req.query.numberOfFiles) {
    numberOfFiles = parseInt(req.query.numberOfFiles as string);
    }
    if(numberOfFiles > 50) {
        res.send('Error too many files to handle')
        return;
    }
    let fileDirectory  = generateMFileWithRandomNumbers(numberOfFiles,10,1000);
    var filePaths = [];
    for (let index = 0; index < numberOfFiles; index++) {
        filePaths.push(`./${fileDirectory}/${index}.csv`);
    }
    res.json({
        numberOfFiles: numberOfFiles,
        filePaths: filePaths,
    });
});

app.post('/getFile',(req: Request,res:Response) => {
    res.sendFile(req.params.filePath);
})

app.get('/getAllServerStatus',(req:Request, res:Response)=>{ 
    let numberOfServers = 10;
    var serverStatus = []
    for (let index = 0; index < numberOfServers; index++) {
        serverStatus.push({
            name: '',
            id: '',
            currentTaks: null,
            isAvailable: true,
            lastTaskRunningTime: 0,
            lastTaskFailed: false,
            errorCode: 0,
        })
    }
    res.json({
        numberOfServers: numberOfServers,
        serverStatus: serverStatus
    })
    })

app.post('/setServerStatus',(req: Request, res: Response)=> {
    // set Server Status to available or failed
})


app.listen(port,() => {
    console.log(`Started server at port ${port}`);
});
