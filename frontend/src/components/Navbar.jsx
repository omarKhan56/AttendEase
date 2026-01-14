import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, BookOpen, BarChart3, QrCode } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <QrCode className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">AttendEase</span>
            </Link>
            
            <div className="ml-10 flex items-center space-x-4">
              <Link to="/classes" className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                <BookOpen className="h-4 w-4 mr-1" />
                Classes
              </Link>
              
              {user.role === 'student' && (
                <Link to="/attendance/mark" className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  <QrCode className="h-4 w-4 mr-1" />
                  Mark Attendance
                </Link>
              )}
              
              <Link to="/analytics" className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                <BarChart3 className="h-4 w-4 mr-1" />
                Analytics
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user.name} <span className="text-xs text-gray-500">({user.role})</span>
            </span>
            
            <Link to="/profile" className="text-gray-700 hover:text-blue-600">
              <User className="h-5 w-5" />
            </Link>
            
            <button onClick={handleLogout} className="flex items-center text-gray-700 hover:text-red-600">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;