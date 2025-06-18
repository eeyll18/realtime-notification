import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import NotificationArea from "./components/NotificationArea";

function App() {
  return (
    <>
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <>
                <h1>Welcome</h1>
                <NotificationArea />
              </>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
