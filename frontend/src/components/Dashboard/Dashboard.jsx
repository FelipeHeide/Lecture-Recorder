import React from 'react';
import styles from './Dashboard.module.css';

const Dashboard = ({ userName,setSection }) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className={styles.wrapper}>
      <h1>Welcome <b>{userName}</b></h1>
      <div className={styles['button-wrapper']}>
        <button onClick={() => setSection("new")}>Record New Lecture</button>
        <button onClick={() => setSection("lectures")}> Access Recorded Lectures</button>
        <p><a href="mailto:felipe.heide7@gmail.com">Contact Creator</a> <button onClick={handleLogout}>Log Out</button></p>
      </div>
    </div>
  );
};

export default Dashboard;
