import React, { useCallback, useEffect, useState } from 'react';
import {ComputeNode} from './App'
interface ComputeNodeProps {
    computeNode: ComputeNode
}
function ComputeNodeStatus({computeNode}:ComputeNodeProps) {
    const [status, setStatus] = useState<{currentTask: string, status:string, lastTaskMessageID:string}>
       ({currentTask: "", status:"Not Connected", lastTaskMessageID:""})
    useEffect(()=>{
        const sse = new EventSource(computeNode.url+"/status",
            { withCredentials: true });
        function getRealtimeData(data:{currentTask:string,isBusy:boolean,lastTaskMessageID:string}) {
           console.log(data)
            setStatus({
                currentTask:data.currentTask,
                status:data.isBusy ? "Busy" : "Idle",
                lastTaskMessageID : data.lastTaskMessageID
            })
        }
        sse.onmessage = e => getRealtimeData(JSON.parse(e.data));
        sse.onerror = () => {
            setStatus({currentTask: "N/A", status:"Not Connected", lastTaskMessageID:"N/A"})
            sse.close();
        }
        return () => {
            sse.close();
        };
    
    },[
        computeNode
    ])
  return (
    <>
        <div>{computeNode.name}</div>
        <div>{computeNode.url}</div>
        <div>{status.currentTask}</div>
        <div>{status.status}</div>
        <div>{status.lastTaskMessageID}</div>
    </>
  );
}

export default ComputeNodeStatus;
