import fs from 'fs';

function generateMFileWithRandomNumbers(M: number, min: number, max: number) {
    let currentTimeStamp = Date.now();
    createDirSync(`data/${currentTimeStamp.toString()}`);
    for (let index = 0; index < M; index++) {
        generateNRandomNumbersAndSaveToDisk(min + Math.floor(Math.random() * (max - min)), `${index}.csv`, `data/${currentTimeStamp.toString()}`, () => {
            console.log("Created Random Number File")
        });
    }
    return `data/${currentTimeStamp.toString()}`;
}

function generateNRandomNumbersAndSaveToDisk(N: number, fileName: string, directoryName: string, onFinish: () => void) {
    var fd = fs.openSync(`./${directoryName}/${fileName}`, 'w');
    fs.closeSync(fs.openSync(`./${directoryName}/${fileName}`, 'w'));
    let writeStream = fs.createWriteStream(`./${directoryName}/${fileName}`);
    let index = 0;
    function write() {
        let isOk = true
        while (index < N && isOk) {
            if (index == N - 1) {
                writeStream.write(Math.random().toString() + ",");
                writeStream.end();
            }
            else {
                isOk = writeStream.write(Math.random().toString() + ",");
            }
            index++;
        }
        if (index < N - 1) {
            writeStream.once('drain', write);
        }
    }
    writeStream.on('finish', onFinish)
    write();
}

function createDirSync(directoryName: string) {
    directoryName.split('/').reduce((prev, curr) => {
        prev += curr + '/';
        if (!fs.existsSync(prev)) {
            fs.mkdirSync(prev);
        }
        return prev;
    }, '')
}

export {
    generateMFileWithRandomNumbers
}