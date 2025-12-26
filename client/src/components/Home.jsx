import React from "react";
import { useNavigate } from "react-router-dom";

function Home(){
    const navigate = useNavigate()
    const handleTeacher = function(){
        navigate('/teacher')
    }
    const handleStudent = function() {
        navigate('/student')
    }
    return (
        <div className="home-container">
            <h1>Welcome to EasyClass</h1>
            <div className="role-selection">
                <button onClick={handleTeacher}>I am a teacher</button>
                <button onClick={handleStudent}>I am a student</button>
            </div>
        </div>
    )
}