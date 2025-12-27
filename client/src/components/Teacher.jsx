import React from "react";
import { QRCodeSVG } from 'qrcode.react'
import { socket } from '../socket'

function Teacher(){
    const [sessionId, setSessionId] = React.useState(null)
    const [sessionType, setSessionType] = React.useState(null)
    const [students, setStudents] = React.useState([])
    const [question, setQuestion] = React.useState('')
    const [answers, setAnswers] = React.useState([])

    // Setting up the listeners
    React.useEffect(()=>{
        // Listening for messages from server
        socket.on('session_created', (id)=>{ 
            setSessionId(id)
        })

        socket.on('update_attendance', (studentList)=>{
            setStudents(studentList)
        })

        socket.on('update_answers', (answerList) => {
            setAnswers(answerList);
        });

        // Turn off the listeners
        return ()=>{
            socket.off('session_created')
            socket.off('update_attendance')
            socket.off('update_answers')
        }
    }, [])

    const createSession = (type) => {
        setSessionType(type);
        socket.emit('create_session', {type})
    }

    const closeSession = ()=>{
        socket.emit('close_session', sessionId)
        setSessionId(null)
        setSessionType(null)
        setStudents([])
        setAnswers([])
        setQuestion('')
    }

    const handleStartAttendance = function(){
        createSession('attendance')
    }

    const handleStartQA = function(){
        createSession('qa')
    }

    const handleSendQuestion = () => {
        socket.emit('set_question', { sessionId, question });
    };

    return (
        <div className="teacher-container">
            <h2>Teacher Dashboard</h2>
            {!sessionId ? (
                <div className="session-controls">
                    <button onClick={handleStartAttendance}>Start Attendance</button>
                    <button onClick={handleStartQA}>Start Question</button>
                </div>
            ) : (
                <div className="active-session">
                    <h3>Class Code: <span className="code">{sessionId}</span></h3>
                    
                    {/* QR Code is always shown for joining */}
                    <div className="qr-code">
                        <QRCodeSVG value={sessionId} size={200} />
                    </div>

                    {/* End Session Button - Placed exactly where you wanted it */}
                    <button onClick={closeSession} style={{backgroundColor: '#e74c3c', display: 'block', margin: '20px auto'}}>End Session</button>

                    {/* Conditional View based on Type */}
                    {sessionType === 'attendance' ? (
                        <div className="student-list">
                            <h4>Students Joined ({students.length})</h4>
                            <ul>
                                {students.map((s)=>(
                                    <li key={s.studentId}>{s.name} ({s.studentId})</li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="qa-section">
                            <div className="question-input">
                                <input 
                                    type="text" 
                                    placeholder="Type your question here..." 
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                />
                                <button onClick={handleSendQuestion}>Send Question</button>
                            </div>
                            
                            <div className="answers-list">
                                <h4>Answers Received ({answers.length})</h4>
                                <ul>
                                    {answers.map((a, index) => (
                                        <li key={index}>
                                            <strong>{a.name}:</strong> {a.answer}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Teacher