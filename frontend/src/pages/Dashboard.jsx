//frontend/src/pages/Dashboard.jsx

import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Calendar, TrendingUp } from 'lucide-react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

// What does this component do?
// This component serves as the dashboard for the AttendEase platform,
// providing users with an overview of attendance data.

const Dashboard = () => {

  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {

    try {

      // 🔥 FETCH PAGINATED CLASSES
      const classesRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/classes?page=1&limit=100`
      );

      // 🔥 IMPORTANT
      // Backend now returns:
      // {
      //   classes: [],
      //   currentPage,
      //   totalPages
      // }

      const classes = classesRes.data.classes || [];

      // ================= STUDENT =================

      if (user.role === 'student') {

        const analyticsRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/analytics/student`
        );

        setStats({
          totalClasses: classes.length,
          overallAttendance: analyticsRes.data.overallPercentage,
          classStats: analyticsRes.data.classStats
        });

      }

      // ================= FACULTY =================

      else if (user.role === 'faculty') {

        const totalStudents = classes.reduce(
          (sum, cls) => sum + (cls.students?.length || 0),
          0
        );

        setStats({
          totalClasses: classes.length,
          totalStudents
        });

      }

      // ================= ADMIN =================

      else {

        setStats({
          totalClasses: classes.length
        });

      }

    } catch (error) {

      console.error('Error fetching dashboard data:', error);

    } finally {

      setLoading(false);

    }
  };

  // ================= LOADING =================

  if (loading) {

    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ================= UI =================

  return (

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user.name}!
        </h1>

        <p className="mt-2 text-gray-600">
          Here's your attendance overview
        </p>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {/* TOTAL CLASSES */}

        <div className="bg-white rounded-lg shadow p-6">

          <div className="flex items-center">

            <div className="p-3 bg-blue-100 rounded-lg">

              <BookOpen className="h-6 w-6 text-blue-600" />

            </div>

            <div className="ml-4">

              <p className="text-sm font-medium text-gray-600">
                Total Classes
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalClasses || 0}
              </p>

            </div>

          </div>

        </div>

        {/* STUDENT ATTENDANCE */}

        {user.role === 'student' && (

          <div className="bg-white rounded-lg shadow p-6">

            <div className="flex items-center">

              <div className="p-3 bg-green-100 rounded-lg">

                <TrendingUp className="h-6 w-6 text-green-600" />

              </div>

              <div className="ml-4">

                <p className="text-sm font-medium text-gray-600">
                  Overall Attendance
                </p>

                <p className="text-2xl font-bold text-gray-900">
                  {stats?.overallAttendance || 0}%
                </p>

              </div>

            </div>

          </div>

        )}

        {/* FACULTY TOTAL STUDENTS */}

        {user.role === 'faculty' && (

          <div className="bg-white rounded-lg shadow p-6">

            <div className="flex items-center">

              <div className="p-3 bg-purple-100 rounded-lg">

                <Users className="h-6 w-6 text-purple-600" />

              </div>

              <div className="ml-4">

                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>

                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalStudents || 0}
                </p>

              </div>

            </div>

          </div>

        )}

        {/* DATE */}

        <div className="bg-white rounded-lg shadow p-6">

          <div className="flex items-center">

            <div className="p-3 bg-yellow-100 rounded-lg">

              <Calendar className="h-6 w-6 text-yellow-600" />

            </div>

            <div className="ml-4">

              <p className="text-sm font-medium text-gray-600">
                Today's Date
              </p>

              <p className="text-lg font-bold text-gray-900">
                {new Date().toLocaleDateString()}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* STUDENT CLASS-WISE ATTENDANCE */}

      {user.role === 'student' && stats?.classStats && (

        <div className="bg-white rounded-lg shadow p-6 mb-8">

          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Class-wise Attendance
          </h2>

          <div className="space-y-4">

            {stats.classStats.map((cls, index) => (

              <div
                key={index}
                className="border-b pb-4 last:border-b-0"
              >

                <div className="flex justify-between items-center mb-2">

                  <div>

                    <h3 className="font-semibold text-gray-900">
                      {cls.className}
                    </h3>

                    <p className="text-sm text-gray-600">
                      {cls.classCode}
                    </p>

                  </div>

                  <span
                    className={`text-lg font-bold ${
                      parseFloat(cls.percentage) >= 75
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {cls.percentage}%
                  </span>

                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">

                  <div
                    className={`h-2 rounded-full ${
                      parseFloat(cls.percentage) >= 75
                        ? 'bg-green-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${cls.percentage}%` }}
                  ></div>

                </div>

                <p className="text-xs text-gray-600 mt-1">
                  {cls.present} present / {cls.totalSessions} total sessions
                </p>

              </div>

            ))}

          </div>

        </div>

      )}

      {/* NAVIGATION CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Link
          to="/classes"
          className="bg-blue-600 text-white rounded-lg shadow p-6 hover:bg-blue-700 transition"
        >

          <BookOpen className="h-8 w-8 mb-2" />

          <h3 className="text-xl font-bold mb-2">
            View Classes
          </h3>

          <p className="text-blue-100">
            See all your enrolled classes
          </p>

        </Link>

        <Link
          to="/analytics"
          className="bg-purple-600 text-white rounded-lg shadow p-6 hover:bg-purple-700 transition"
        >

          <TrendingUp className="h-8 w-8 mb-2" />

          <h3 className="text-xl font-bold mb-2">
            Analytics
          </h3>

          <p className="text-purple-100">
            View detailed attendance reports
          </p>

        </Link>

      </div>

    </div>
  );
};

export default Dashboard;