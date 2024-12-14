import React from 'react';
import techImage from './smartLine.jpg';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Home() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/login');
  };
  return (
      <div onClick={handleClick}>
        <img src={techImage} alt="SmartAssemblyLine" className='Dept'/>
      </div>
  );
}

export default Home;