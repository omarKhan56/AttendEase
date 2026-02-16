// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import EnrollStudents from './pages/EnrollStudents';
import CreateClass from './pages/CreateClass';
import ClassDetails from './pages/ClassDetails';
import MarkAttendance from './pages/MarkAttendance';
import AttendanceHistory from './pages/AttendanceHistory';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';


{/* {/* Wrap the entire app in Router to enable routing */} 

function App() {
  return (
    <AuthProvider> {/*AuthProvider is a global place that stores login information and shares it with the entire app. */}
      <Router> {/* Wrap the entire app in Router to enable routing */}
        <div className="min-h-screen bg-gray-50">
          <Navbar /> {/* Navbar is outside of Routes to show on all pages */}
          <Routes> {/* Define all routes here */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/classes" element={<PrivateRoute><Classes /></PrivateRoute>} />
            <Route path="/classes/create" element={<PrivateRoute><CreateClass /></PrivateRoute>} />
            <Route path="/classes/:id" element={<PrivateRoute><ClassDetails /></PrivateRoute>} />
            <Route path="/classes/:classId/enroll" element={<PrivateRoute><EnrollStudents /></PrivateRoute>} />
            <Route path="/attendance/mark" element={<PrivateRoute><MarkAttendance /></PrivateRoute>} />
            <Route path="/attendance/history" element={<PrivateRoute><AttendanceHistory /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
