import React from "react";
import { QRCodeSVG } from 'qrcode.react'
import { socket } from '../socket'

function Teacher(){
    const [sessionId, setSessionId] = React.useState(null)
    const [students, setStudents] = React.useState([])

    // Setting up the listeners
    React.useEffect(()=>{
        // Listening for messages from server
        socket.on('session_created', (id)=>{ 
            setSessionId(id)
        })

        socket.on('update_attendance', (studentList)=>{
            setStudents(studentList)
        })

        // Turn off the listeners
        return ()=>{
            socket.off('session_created')
            socket.off('update_attendance')
        }
    }, []) // Run this code only once when the component first appears on the screen.

    const createSession = (type) => {
        // Sending messages to server
        socket.emit('create_session', {type})
    }

    const closeSession = ()=>{
        socket.emit('close_session', sessionId)
        setSessionId(null)
        setStudents([])
    }

    const handleStartAttendance = function(){
        createSession('attendance')
    }

    const handleStartQA = function(){
        createSession('qa')
    }

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
                    <div className="qr-code">
                        <QRCodeSVG value={sessionId} size={200} />
                    </div>
                    <button onClick={closeSession} style={{backgroundColor: '#e74c3c', display: 'block', margin: '0 auto'}}>End Session</button>
                    <div className="student-list">
                        <h4>Students Joined ({students.length})</h4>
                        <ul>
                            {students.map((s)=>(
                                <li key={s.studentId}>{s.name} ({s.studentId})</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Teacher