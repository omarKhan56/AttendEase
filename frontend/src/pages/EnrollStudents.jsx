// frontend/src/pages/EnrollStudents.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserPlus, Search, Trash2, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';


//What does this component do?
// This component allows faculty or admin users to enroll students into a specific class.
// It fetches the list of all students not already enrolled in the class and displays them in a searchable table.
// Users can select multiple students and enroll them into the class with a single action.



//role of useEffect here:
// The useEffect hook is used to fetch class details and the list of available students when the component mounts or when the classId parameter changes.
// This ensures that the data is loaded and updated correctly based on the selected class.

//role of useState here:
// The useState hook is used to manage the state of the component.


//role of useparams here:
// The useParams hook is used to extract the classId parameter from the URL, which identifies the class for which students are being enrolled.


const EnrollStudents = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const [classData, setClassData] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchClassAndStudents();
  }, [classId]);

  const fetchClassAndStudents = async () => {
    setLoading(true);
    try {
      // Fetch class details
      const classesRes = await axios.get(`${import.meta.env.VITE_API_URL}/classes`);
      const foundClass = classesRes.data.find(cls => cls._id === classId);
      setClassData(foundClass);

      // Fetch all users to find students
      const usersRes = await axios.get(`${import.meta.env.VITE_API_URL}/auth/users`);
      
      // Filter only students who are NOT already enrolled
      const enrolledStudentIds = foundClass.students.map(s => s._id);
      const availableStudents = usersRes.data.filter(
        user => user.role === 'student' && !enrolledStudentIds.includes(user._id)
      );
      
      setAllStudents(availableStudents);
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Failed to load data. Make sure the backend endpoint exists.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleEnrollStudents = async () => {
    if (selectedStudents.length === 0) {
      setErrorMessage('Please select at least one student to enroll');
      return;
    }

    setEnrolling(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Enroll each selected student
      const enrollPromises = selectedStudents.map(studentId =>
        axios.post(`${import.meta.env.VITE_API_URL}/classes/enroll`, {
          classId,
          studentId
        })
      );

      await Promise.all(enrollPromises);

      setSuccessMessage(`Successfully enrolled ${selectedStudents.length} student(s)!`);
      setSelectedStudents([]);
      
      // Refresh data after 1.5 seconds
      setTimeout(() => {
        fetchClassAndStudents();
        setSuccessMessage('');
      }, 1500);
    } catch (error) {
      console.error('Error enrolling students:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to enroll students');
    } finally {
      setEnrolling(false);
    }
  };

  const filteredStudents = allStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/classes/${classId}`)}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center text-sm"
        >
          ← Back to Class Details
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enroll Students</h1>
        <p className="text-gray-600">
          Class: <span className="font-semibold">{classData.name}</span> ({classData.code})
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Currently enrolled: {classData.students?.length || 0} students
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <XCircle className="h-5 w-5 text-red-600 mr-3" />
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, student ID, or email..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Selected Students Count */}
      {selectedStudents.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <UserPlus className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-blue-900 font-medium">
              {selectedStudents.length} student(s) selected
            </span>
          </div>
          <button
            onClick={handleEnrollStudents}
            disabled={enrolling}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
          >
            {enrolling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enrolling...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Enroll Selected
              </>
            )}
          </button>
        </div>
      )}

      {/* Students List */}
      <div className="bg-white rounded-lg shadow">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center">
            <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No students found' : 'All students are enrolled'}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search term'
                : 'There are no available students to enroll in this class'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-6 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents(filteredStudents.map(s => s._id));
                        } else {
                          setSelectedStudents([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr
                    key={student._id}
                    className={`hover:bg-gray-50 cursor-pointer transition ${
                      selectedStudents.includes(student._id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => toggleStudentSelection(student._id)}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => toggleStudentSelection(student._id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.studentId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.department || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.semester || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 How to use:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Search for students using the search bar above</li>
          <li>Click on student rows or checkboxes to select them</li>
          <li>Use "Select All" checkbox to select all filtered students</li>
          <li>Click "Enroll Selected" to add students to this class</li>
          <li>Only students not already enrolled in this class are shown</li>
        </ul>
      </div>
    </div>
  );
};

export default EnrollStudents;