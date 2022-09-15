import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';

import {downloadFileAndSaveToTemp} from './utils';

dotenv.config();

const app:Express = express();
const port = process.env.PORT;

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:8000'
}));
app.use(express.json())

app.post('/downloadfile',async (req: Request,res: Response)=> {
   await downloadFileAndSaveToTemp(req.body.url,req.body.filePath);
   res.json({
    sucess: true
   })
});
app.get('/',(req: Request,res: Response)=> {
    res.send('Distributed Computing Worker Node Server. A Python process can be spawned in this node');
});

app.listen(port,() => {
    console.log(`Started server at port ${port}`);
});
