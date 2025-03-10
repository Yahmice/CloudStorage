import { Link } from "react-router-dom";
import Buttons from '../components/Buttons.jsx'

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="welcome">Добро пожаловать!</h1>
      <p>Выберите действие:</p>
      <Buttons />
    </div>
  );
};

export default Home;
