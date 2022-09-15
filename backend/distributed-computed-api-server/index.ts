import express, {Express, Request, Response} from 'express';
import {generateMFileWithRandomNumbers} from './generateRandomNumbers';
import {sendTaskToSQS} from './sendTaskToSQS';
import dotenv from 'dotenv';
import { SERVERS } from './const';

dotenv.config();

const app:Express = express();
const port = process.env.PORT;

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(express.json());


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

app.post('/getFile',(req: Request,res:Response) => {
    // Since ts is compile inside the dist folder we go to the parent directory
    res.sendFile(req.body.filePath as string,{root:__dirname+"/.."});
})

app.post('/sendTaskToSQS',async (req:Request,res:Response) => {
    let messageID  = await sendTaskToSQS(req.body.filePath);
    res.json({
        status: true,
        messageID: messageID
    })
})

app.post('/getServerInfo',(req:Request,res:Response) => {
   res.json(SERVERS);
})

app.listen(port,() => {
    console.log(`Started server at port ${port}`);
});
