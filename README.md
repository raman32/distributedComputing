# Distirbuted computing using queues
## TO set up environment
Clone the repository and run the following command
``` cd frontend\distributed-computing-frontend && yarn install```
``` cd backend\distributed-computed-api-server && yarn install```

### To run the frontend server
``` cd frontend\distributed-computing-frontend && yarn run start ```
### To run the backed server on port 8000
``` export PORT=8000 && cd backend\distributed-computed-api-server && yarn run start ```
### To run the worker node 
Use the Dockerfile to create a image name worker
```  docker build -t worker .```
and run
``` docker-compose up  ```

## To run in dev environment 
To run in dev environment ```yarn run dev``` instead of ```yarn run start```.
