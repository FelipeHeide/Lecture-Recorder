import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm/LoginForm';
import Dashboard from './components/Dashboard/Dashboard';
import New from './components/New/New';
import Lectures from './components/Lectures/Lectures';
import './index.css';
import { Get } from "./ApiAssets.js"

const App = () => {
  const [section, setSection] = useState(null);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 950);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const fetchData = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        const updatedUser = await Get(storedUser.user._id, storedUser.token);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setSection("dashboard");
      } else {
        setSection("login");
      }
    };
    fetchData();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (isMobile) {
    alert('This site is not available on cellphones YET.');
    window.open("about:blank", "_self");
    window.close();
    return null;
  }

  return (
    <div>
      {section === "login" ? (
        <LoginForm setUser={setUser} setSection={setSection} />
      ) : section === "dashboard" ? (
        <Dashboard userName={user?.user?.username} setSection={setSection} />
      ) : section === "new" ? (
        <New setSection={setSection} />
      ) : section === "lectures" ? (
        <Lectures userName={user?.user?.username} setSection={setSection} />
      ) : null}
    </div>
  );
};

export default App;
