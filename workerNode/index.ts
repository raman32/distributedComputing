import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app:Express = express();
const port = process.env.PORT;

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:8000'
}));


app.get('/',(req: Request,res: Response)=> {
    res.send('Distributed Computing Worker Node Server. A Python process can be spawned in this node');
});

app.listen(port,() => {
    console.log(`Started server at port ${port}`);
});
