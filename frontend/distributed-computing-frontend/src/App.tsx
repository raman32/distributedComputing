import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import ComputeNodeStatus from './ComputeNodeStatus';

export interface RandomFiles {
  filePaths: string[],
  numberOfFiles: number
}

export type AggregationOperation = "AVERAGE" | "MAX" | "MIN"

export type TaskStatus = "WAITING" | "RUNNING" | "COMPLETED" | "BLOCKED" | "ABORTED"

export interface Task {
  name: string,
  file: string,
  operation : AggregationOperation,
  createdAt: number,
  estimatedRuntime: number,
  shouldRetryOnFailure:  boolean,
  maxNumberOfRetries: number,
  status: TaskStatus
}

export interface ComputeNode {
  name: string,
  url: string,
}

export interface ComputeNodeStatus {
  currentTask : string,
  isBusy: boolean;
  lastTaksMessageID : string;

}

function App() {
  const [numOfRandomFiles, setNumOfRandomFiles] = useState<number>(0);
  const [numOfNodes, setNumberOfNodes] = useState<number>(0);
  const [computeNodes,setComputeNodes] = useState<ComputeNode[]>([])
  const [randomFiles, setRandomFiles] = useState<RandomFiles | null>(null);
  useEffect(()=>{
    fetch("http://localhost:8000/getServerInfo",{method:"POST"}).then(data=>data.json()).then(setComputeNodes);
  },[])
  
  console.log(computeNodes)
  const generate = useCallback(() => {
    fetch("http://localhost:8000/generateRandomFile?numberOfFiles=" + numOfRandomFiles.toString()).then(
      (res) => res.json()
    ).then((data) => setRandomFiles(data))
  }, [numOfRandomFiles])
  const distribute = useCallback(()=>{
    // Distribute the Task on the queue.
  },[numOfNodes])
  return (
    <div className="App">
      <div>
        <div>
          Please Enter the Number of Files that you want to Generate and click generate.
        </div>
        <input type={'number'} value={numOfRandomFiles} onChange={({ target: { value } }) => setNumOfRandomFiles(parseInt(value))} />
        <button onClick={generate}>
          Generate
        </button>
      </div>
      <div style={{marginTop: 20, minHeight: 100}}>
      Currently generated random files are:
      <div>
        {randomFiles && randomFiles.filePaths.map((ele, index) => (
          <div key={index}>
            {ele}
          </div>
        ))}
      </div>
      </div>
      <div style={{marginTop: 20, minHeight: 100}}>
      Current Status of compute Nodes
      <div>
        <div style={{display:"grid",columnGap: 1, gridTemplateColumns: "auto auto auto auto auto", backgroundColor:"lightgray"}}>
              <div>name</div>
              <div>url</div>
              <div>current Task</div>
              <div>status</div>
              <div>lastTaskMessageID</div>
            </div>
        { computeNodes && computeNodes.map((ele, index) => (
          <div key={index} style={{display:"grid",columnGap: 1, gridTemplateColumns: "auto auto auto auto auto", backgroundColor:"lightblue"}}>
           <ComputeNodeStatus computeNode={ ele}/>
          </div>
        ))}
      </div>
      </div>
      <div style={{marginTop: 20}}>
        Select the Number of Nodes that you want to distribute the aggregation operation:
        <div>
        <input type={'number'} value={numOfNodes} onChange={({ target: { value } }) => setNumberOfNodes(parseInt(value))} />
        <button onClick={generate}>
          Compute
        </button>
        </div>
      </div>
    </div>
  );
}

export default App;
