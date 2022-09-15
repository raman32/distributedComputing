import fs from 'fs';
import {pipeline} from 'stream';
import {promisify} from 'util'
import fetch from 'node-fetch';

async function downloadFileAndSaveToTemp(url: string, filePath: string) {

    const streamPipeline = promisify(pipeline);
    const body = {filePath}
    const response = await fetch(url,{
        method: 'post',
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}
    });
    
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    if(response.body)
    await streamPipeline(response.body, fs.createWriteStream('./temp.csv'));
}

async function calculateAverage() {
   return new Promise<{average:number,currentCount:number}>((resolve, reject) => {
    let readable = fs.createReadStream('temp.csv');
    var average = 0;
    var currentCount = 0;
    var prevChunk = '';
    readable.on('data', async (chunk) => {
        let values = chunk.toString().split(",");
        values[0] = prevChunk+values[0];
        if(chunk[chunk.length-1] != ",")
            prevChunk = values[values.length-1];
        var sum = 0;
        for (let index = 0; index < values.length-1; index++) {
            sum += parseFloat(values[index]);  
        }
        average = (average* currentCount + sum )/(currentCount + (values.length-1))
        currentCount += (values.length-1);
    })
    readable.on('end', () => {
       resolve({average,currentCount});
    })
      });
}
export {
    downloadFileAndSaveToTemp,
    calculateAverage
}