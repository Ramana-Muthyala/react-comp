import './App.css';
import { Suspense, useState } from 'react';
import { GanttChart } from './comp/GanttChart';
import { data, conf } from './comp/GanttChartData';

export default function App() {
  return (
    <Suspense fallback={<BigSpinner />}>
      <Router />
    </Suspense>
  );
}

function Router() {
  const [page, setPage] = useState('/');

  function navigate(url) {
    setPage(url);
  }

  let content;
  if (page === '/') {
    content = (
      <IndexPage navigate={navigate} />
    );
  } else if (page === '/ganttChart') {
    content = (
      <div style={{padding: "20px"}}>
        <div style={{padding: "20px"}}>
          <button onClick={() => navigate('/')}>
            Back
          </button>          
        </div>
        <div style={{paddingLeft: "20px"}}>
          <GanttChart data={data} conf={conf}></GanttChart>
        </div>  
      </div>    
    );
  }
  return (
    <>
      {content}
    </>
  );
}

function BigSpinner() {
  return <h2>🌀 Loading...</h2>;
}

function IndexPage({ navigate }) {
  return (
    <div style={{padding: "20px"}}>
      <p><b><u>React components</u></b></p>
      <div style={{padding: "20px"}}>
        <span>
          <button onClick={() => navigate('/ganttChart')}>
            Gantt Chart
          </button>      
          </span>
      </div>
    </div>
  );
}

