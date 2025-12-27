import React from 'react';
import { socket } from '../socket';

function Student() {
  const [step, setStep] = React.useState(1); // 1: Join, 2: Name, 3: Active
  const [sessionId, setSessionId] = React.useState('')
  const [name, setName] = React.useState('')
  const [studentId, setStudentId] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [currentQuestion, setCurrentQuestion] = React.useState(''); 
  const [myAnswer, setMyAnswer] = React.useState('');               
  const [sessionType, setSessionType] = React.useState('');         

  React.useEffect(() => {
    // 1. Confirmation that we joined the room
    socket.on('session_joined', (data) => {
      setStep(2); // Name input
      setMessage('')
      setSessionType(data.type)
      if(data.question){
        setCurrentQuestion(data.question)
      }
    })

    // NEW: Listen for new questions
    socket.on('new_question', (q) => {
      setCurrentQuestion(q)
    })

    socket.on('error', (err) => {
      alert(err)
    })

    // 3. Teacher closed the session
    socket.on('session_closed', () => {
      alert('Session ended by teacher')
      setStep(1);
      setSessionId('')
      setCurrentQuestion('')
      setMyAnswer('')     
    })

    return () => {
      socket.off('session_joined')
      socket.off('error')
      socket.off('session_closed')
      socket.off('new_question')
    }
  }, [])

  const handleJoin = () => {
    if (sessionId) {
      socket.emit('join_session', sessionId.toUpperCase());
    }
  }

  const handleSignIn = () => {
    if (name&&studentId) {   
      socket.emit('sign_in', { 
        sessionId, 
        studentId, 
        name 
      })
      
      setStep(3) // Waiting screen
    }
  }

  const handleSessionIdChange = (e) => {
    setSessionId(e.target.value)
  }

  const handleNameChange = (e) => {
    setName(e.target.value)
  }

  const handleStudentIdChange = (e) => setStudentId(e.target.value)

  const handleSubmitAnswer = () => {
    socket.emit('submit_answer', {
        sessionId,
        studentId,
        name,
        answer: myAnswer
    });
    setMyAnswer(''); // Clear input
    alert('Answer submitted!');
  };

  return (
    <div className="student-container">
      <h2>Student Dashboard</h2>

      {step === 1 && (
        <div className="join-form">
          <input
            type="text"
            placeholder="Enter Room Code"
            value={sessionId}
            onChange={handleSessionIdChange}
          />
          <button onClick={handleJoin}>Join Class</button>
        </div>
      )}

      {step === 2 && (
        <div className="name-form">
          <h3>Room: {sessionId}</h3>
          <input
            type="text"
            placeholder="Enter Your Name"
            value={name}
            onChange={handleNameChange}
          />
          <input 
            type="text"
            placeholder='Enter your student ID'
            value={studentId}
            onChange={handleStudentIdChange}
          />
          <button onClick={handleSignIn}>Sign In</button>
        </div>
      )}

        {step === 3 && (
            <div className="waiting-room">
            <h3>Welcome, {name}!</h3>
            <p>ID: {studentId}</p>
            {sessionType === 'attendance' ? (
                <p>You are signed in. Wait for teacher.</p>
            ) : (
                <div className="qa-student">
                    <h4>Question:</h4>
                    <p className="question-text" style={{fontSize: '1.2em', fontWeight: 'bold'}}>
                        {currentQuestion || "Waiting for question..."}
                    </p>
                  
                    {currentQuestion && (
                        <>
                          <input 
                            type="text" 
                            placeholder="Type your answer..."
                            value={myAnswer}
                            onChange={(e) => setMyAnswer(e.target.value)}
                          />
                          <button onClick={handleSubmitAnswer}>Submit Answer</button>
                        </>
                    )}
                </div>
              )}
          </div>
        )}
    </div>
  )
}

export default Student