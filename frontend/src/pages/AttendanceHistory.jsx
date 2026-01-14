import { useState, useEffect, useContext } from 'react';
import { Calendar, Filter } from 'lucide-react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';


// What does this component do?
// This component displays the attendance history for the currently logged-in user.
// It fetches attendance data from the backend API and presents it in a user-friendly layout.
// Users can filter the history by class and view details such as date, class name, student name (for faculty), status, marked by, and time.
// It provides feedback when there are no records to display.

// Role of useContext here:
// The useContext hook is used to access the AuthContext, which contains information about the currently logged-in user.

//Role of AuthContext here:
// The AuthContext provides the authenticated user's information, which is essential for fetching and displaying the correct attendance history based on the user's role (student or faculty).
// It allows the component to tailor the displayed data according to whether the user is a student or faculty member.

//Role of Axios here:
// Axios is used to make HTTP requests to the backend API to fetch attendance history and class data.
// It simplifies the process of sending requests and handling responses. 

const AttendanceHistory = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
    fetchHistory();
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/classes`);
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const url = selectedClass 
        ? `${import.meta.env.VITE_API_URL}/attendance/history/${selectedClass}`
        : `${import.meta.env.VITE_API_URL}/attendance/history`;
      const { data } = await axios.get(url);
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance History</h1>
        <p className="text-gray-600">View past attendance records</p>
      </div>

      {classes.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filter by Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} ({cls.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No attendance records found</h3>
          <p className="text-gray-600">Start marking attendance to see your history</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  {user.role !== 'student' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marked By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.class?.name} ({record.class?.code})
                    </td>
                    {user.role !== 'student' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.student?.name}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'present'
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {record.markedBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;