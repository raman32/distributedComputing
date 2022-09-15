// Load the AWS SDK for Node.js
import AWS from 'aws-sdk';

function recieveResultsFromSQS() {
    return new Promise<string | undefined>((resolve, reject) => {
        console.log("Getting Resutls")
        // Set the region 
        AWS.config.update({ region: 'us-east-1' });
        // Create an SQS service object
        var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
        var queueURL = "https://sqs.us-east-1.amazonaws.com/234418706789/resultQueue";
        var params = {
            // Remove DelaySeconds parameter and value for FIFO queues
            AttributeNames: [
                "SentTimestamp"
            ],
            MaxNumberOfMessages: 10,
            MessageAttributeNames: [
                "All"
            ],
            VisibilityTimeout: 40,
            WaitTimeSeconds: 0,
            QueueUrl: queueURL
        };


        sqs.receiveMessage(params, function (err, data) {
            if (err) {
                reject(err)
            } else if (data.Messages) {
                var deleteParams = {
                    QueueUrl: queueURL,
                    ReceiptHandle: data.Messages[0].ReceiptHandle as string
                };
                sqs.deleteMessage(deleteParams, function (err, data_) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(data.Messages ? data.Messages[0].Body : undefined);
                    }
                });
            }
        })
    })
}
export {
    recieveResultsFromSQS
}
