import React, { useCallback, useEffect, useState } from 'react';
import {ComputeNode} from './App'
interface TaskStatusProps {

}
function TaskStatus() {
    const [tasks,setTask] = useState<{
        currentRunningTask :string[]
        currentAggregatedResults : {"average":number,"currentCount":number,"currentTask":string}[]
    }> ({ currentRunningTask:[],currentAggregatedResults:[]})
    const [result,setResult] = useState <{
        "average": number,
        "currentCount": number
    }>({
        "average": 0,
        "currentCount": 0
    });
    useEffect(()=>{
        const sse = new EventSource("http://localhost:8000/status",
            { withCredentials: true });
        function getRealtimeData(data:{
            currentRunningTask :string[]
            currentAggregatedResults : {"average":number,"currentCount":number,"currentTask":string}[]
        }) {
           console.log(data)
            setTask(data)
        }
        sse.onmessage = e => getRealtimeData(JSON.parse(e.data));
        sse.onerror = () => {
            setTask({ currentRunningTask:[],currentAggregatedResults:[]})
            sse.close();
        }
        return () => {
            sse.close();
        };
    
    },[])

    useEffect(()=>{
        if(tasks.currentAggregatedResults.length == tasks.currentRunningTask.length) {
            fetch("http://localhost:8000/getAverage",{method:"POST"}).then(data=>data.json()).then(setResult);
        }
    },[tasks])

  return (
    <>
        {tasks.currentRunningTask.map((task)=>(<div key ={task}>
            <div>{task}</div>
            <div>{tasks.currentAggregatedResults.find((ele)=>ele.currentTask == task)?.average ?? "Pending"}</div>
            <div>{tasks.currentAggregatedResults.find((ele)=>ele.currentTask == task)?.currentCount ?? "Pending"}</div>
        </div>))}
        
        <div>
            <div>
                Average: {result.average}
            </div>
            <div>
                Count: {result.currentCount}
            </div>
        </div>
      
    </>
  );
}

export default TaskStatus;
