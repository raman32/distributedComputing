import {createWriteStream} from 'fs';
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
    await streamPipeline(response.body, createWriteStream('./temp.csv'));
}
export {
    downloadFileAndSaveToTemp
}