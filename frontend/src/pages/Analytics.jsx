import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, AlertCircle } from 'lucide-react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];


// What does this component do?
// This component provides detailed attendance analytics for both students and faculty members.
// It fetches attendance data from the backend API and displays various statistics and visualizations.
// For students, it shows overall attendance percentage and class-wise breakdown.
// For faculty, it provides class-specific analytics including total students, attendance trends, student-wise attendance, and highlights students with low attendance.
// It allows faculty to select different classes to view their respective analytics.
// It uses charts to visualize attendance trends and distributions effectively.
// It adapts its content based on the user's role (student or faculty) to provide relevant insights.

//Role of useSearchParams here:
// The useSearchParams hook is used to read query parameters from the URL.
// In this component, it retrieves the classId parameter to pre-select a class for faculty users when viewing analytics.

//Role of AuthContext here:
//the AuthContext is used to access information about the currently logged-in user, including their role (student or faculty).

//Role of useState here:
//The useState hook is used to manage the state of the component.
// It maintains states for analytics data, list of classes, selected class, and loading status.

//Role of useContext here:
//The useContext hook is used to access the AuthContext, which contains information about the currently logged-in user.

//what are hooks in react?
// Hooks are special functions in React that allow you to use state and other React features in functional components.


const Analytics = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');
  
  const [analytics, setAnalytics] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(classId || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchAnalytics();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/classes`);
      setClasses(data);
      if (data.length > 0 && !selectedClass) {
        setSelectedClass(data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      if (user.role === 'student') {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/student`);
        setAnalytics(data);
      } else {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/class/${selectedClass}`);
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Analytics</h1>
        <p className="text-gray-600">Detailed insights and reports</p>
      </div>

      {user.role === 'faculty' && classes.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} ({cls.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {analytics && (
        <>
          {user.role === 'faculty' && analytics.classInfo && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Students</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.classInfo.totalStudents}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.classInfo.totalSessions}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Low Attendance</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.lowAttendanceStudents?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {analytics.dateWiseAttendance && analytics.dateWiseAttendance.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Attendance Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.dateWiseAttendance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} name="Students Present" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {analytics.studentStats && analytics.studentStats.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Student-wise Attendance</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Present
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Absent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Percentage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analytics.studentStats.map((student, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.studentId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              {student.present}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                              {student.absent}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                parseFloat(student.percentage) >= 75
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {student.percentage}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {analytics.lowAttendanceStudents && analytics.lowAttendanceStudents.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Students with Low Attendance (&lt;75%)
                  </h3>
                  <div className="space-y-2">
                    {analytics.lowAttendanceStudents.map((student, index) => (
                      <div key={index} className="flex justify-between items-center bg-white p-3 rounded">
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.studentId}</p>
                        </div>
                        <span className="text-red-600 font-bold">{student.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {user.role === 'student' && analytics.classStats && (
            <>
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Overall Performance</h3>
                <div className="text-center">
                  <p className="text-5xl font-bold text-blue-600 mb-2">{analytics.overallPercentage}%</p>
                  <p className="text-gray-600">Overall Attendance</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Class-wise Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.classStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="classCode" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="percentage" fill="#3B82F6" name="Attendance %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analytics.classStats.map((cls, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-6">
                    <h4 className="font-bold text-gray-900 mb-2">{cls.className}</h4>
                    <p className="text-sm text-gray-600 mb-4">{cls.classCode}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Present:</span>
                        <span className="font-medium text-green-600">{cls.present}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Absent:</span>
                        <span className="font-medium text-red-600">{cls.absent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Sessions:</span>
                        <span className="font-medium text-gray-900">{cls.totalSessions}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Percentage:</span>
                          <span className={`text-xl font-bold ${parseFloat(cls.percentage) >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                            {cls.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;