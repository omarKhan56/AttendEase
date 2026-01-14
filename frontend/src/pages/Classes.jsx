import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Users, Calendar } from 'lucide-react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';


//What does this component do?
// This component displays a list of classes for the currently logged-in user.
// It fetches class data from the backend API and presents it in a user-friendly layout.

// Role of useContext here:
// The useContext hook is used to access the AuthContext, which contains information about the currently logged-in user.


const Classes = () => {
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/classes`);
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user.role === 'faculty' ? 'My Classes' : 'Enrolled Classes'}
          </h1>
          <p className="mt-2 text-gray-600">
            {user.role === 'faculty' ? 'Manage your classes and attendance' : 'View your class schedule and attendance'}
          </p>
        </div>
        
        {user.role === 'faculty' && (
          <Link
            to="/classes/create"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Class
          </Link>
        )}
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No classes found</h3>
          <p className="text-gray-600">
            {user.role === 'faculty' 
              ? 'Create your first class to get started'
              : 'You are not enrolled in any classes yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Link
              key={cls._id}
              to={`/classes/${cls._id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {cls.code}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{cls.name}</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{cls.students?.length || 0} students</span>
                </div>
                
                {cls.faculty && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Faculty: {cls.faculty.name}</span>
                  </div>
                )}
                
                {cls.department && (
                  <div className="text-xs text-gray-500">
                    {cls.department} • Semester {cls.semester}
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <span className="text-sm text-blue-600 font-medium">View Details →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Classes;