import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QrCode, Users, Calendar, BarChart3, UserPlus } from 'lucide-react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';


// What does this component do?
// This component displays detailed information about a specific class, including its name, code, department, semester, schedule, and enrolled students.
// It allows faculty members to generate a QR code for attendance marking and provides links to view analytics and enroll students.
// It fetches class details from the backend API based on the class ID from the URL parameters.


const ClassDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [classData, setClassData] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/classes`);
      const foundClass = data.find(cls => cls._id === id);
      setClassData(foundClass);
    } catch (error) {
      console.error('Error fetching class details:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async () => {
    setGenerating(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/attendance/generate-qr`, {
        classId: id
      });
      setQrData(data);
      
      // Auto-hide QR after expiry
      setTimeout(() => {
        setQrData(null);
      }, data.expiryMinutes * 60 * 1000);
    } catch (error) {
      console.error('Error generating QR:', error);
      alert(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Class not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">{classData.name}</h1>
    <p className="text-gray-600">Class Code: {classData.code}</p>
    {classData.department && (
      <p className="text-sm text-gray-500">
        {classData.department} • Semester {classData.semester}
      </p>
    )}
  </div>
  
  <div className="flex gap-3">
    <Link
      to={`/analytics?classId=${id}`}
      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
    >
      <BarChart3 className="h-5 w-5 mr-2" />
      View Analytics
    </Link>
    
    <Link
      to={`/classes/${id}/enroll`}
      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      <UserPlus className="h-5 w-5 mr-2" />
      Enroll Students
    </Link>
  </div>
</div>
    

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{classData.students?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Schedule</p>
                <p className="text-sm font-medium text-gray-900">
                  {classData.schedule?.length || 0} sessions/week
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center">
              <QrCode className="h-6 w-6 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-sm font-medium text-gray-900">
                  {classData.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {user.role === 'faculty' && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Management</h3>
            
            {!qrData ? (
              <button
                onClick={generateQR}
                disabled={generating}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
              >
                <QrCode className="h-5 w-5 mr-2" />
                {generating ? 'Generating...' : 'Generate QR Code for Today'}
              </button>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Attendance QR Code</h4>
                <img
                  src={qrData.qrImage}
                  alt="Attendance QR Code"
                  className="mx-auto mb-4 border-4 border-blue-600 rounded-lg"
                  style={{ maxWidth: '300px' }}
                />
                <p className="text-sm text-gray-600 mb-2">
                  Students can scan this code to mark their attendance
                </p>
                <p className="text-xs text-red-600 font-medium">
                  Expires in {qrData.expiryMinutes} minutes (at {new Date(qrData.validUntil).toLocaleTimeString()})
                </p>
                <button
                  onClick={() => setQrData(null)}
                  className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Close QR Code
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {classData.schedule && classData.schedule.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Class Schedule</h3>
          <div className="space-y-2">
            {classData.schedule.map((sch, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{sch.day}</span>
                <span className="text-gray-600">{sch.startTime} - {sch.endTime}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {classData.students && classData.students.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Enrolled Students</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classData.students.map((student) => (
                  <tr key={student._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.studentId}
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

export default ClassDetails;