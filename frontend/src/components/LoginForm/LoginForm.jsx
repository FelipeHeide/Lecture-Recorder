import React, { useState } from 'react';
import styles from './LoginForm.module.css';
import { FaUser, FaLock } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { Login, Register } from '../../ApiAssets';

const LoginForm = (props) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleToggleForm = () => {
    setIsRegistering(!isRegistering);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await Register(name, username, email, password);

      if (response) {
        localStorage.setItem('user', JSON.stringify(response));
        console.log('Registration successful:', response);
        props.setUser(response);
        props.setSection("dashboard");
      } else {
        alert('Registration failed: Invalid response from server');
      }
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await Login(username, password);

      if (response) {
        localStorage.setItem('user', JSON.stringify(response));
        console.log('Login successful:', response);
        props.setUser(response);
        props.setSection("dashboard");
      } else {
        alert('Login failed: Invalid response from server');
      }
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className={styles.wrapper}>
      {isRegistering ? (
        <form onSubmit={handleRegister} autoComplete="off">
          <h1>Register</h1>
          <div className={styles['input-box']}>
            <input
              type='text'
              placeholder='Name'
              autoComplete="off"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FaUser className={styles.icon} />
          </div>
          <div className={styles['input-box']}>
            <input
              type='text'
              placeholder='Username'
              autoComplete="off"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <FaUser className={styles.icon} />
          </div>
          <div className={styles['input-box']}>
            <input
              type='email'
              placeholder='Email'
              autoComplete="off"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <MdEmail className={styles.icon} />
          </div>
          <div className={styles['input-box']}>
            <input
              type='password'
              placeholder='Password'
              autoComplete="off"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FaLock className={styles.icon} />
          </div>
          <button type='submit'>Register</button>
        </form>
      ) : (
        <form onSubmit={handleLogin} autoComplete="off">
          <h1>Login</h1>
          <div className={styles['input-box']}>
            <input
              type='text'
              placeholder='Username'
              autoComplete="off"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <FaUser className={styles.icon} />
          </div>
          <div className={styles['input-box']}>
            <input
              type='password'
              placeholder='Password'
              autoComplete="off"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FaLock className={styles.icon} />
          </div>
          <button type='submit'>Login</button>
        </form>
      )}
      <div className={styles['register-link']}>
        <p>
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          <a href='#' onClick={handleToggleForm}>
            {isRegistering ? ' Login' : ' Register'}
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
