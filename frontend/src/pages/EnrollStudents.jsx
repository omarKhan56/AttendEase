// frontend/src/pages/EnrollStudents.jsx
// frontend/src/pages/EnrollStudents.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  UserPlus,
  Search,
  CheckCircle,
  XCircle
} from 'lucide-react';

import axios from 'axios';

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

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchClassAndStudents();
  }, [classId, page]);

  const fetchClassAndStudents = async () => {

    setLoading(true);

    try {

      const classesRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/classes?page=1&limit=100`
      );

      const foundClass = classesRes.data.classes?.find(
        cls => cls._id === classId
      );

      // ✅ FIX 1: prevent crash if class not found
      if (!foundClass) {
        setClassData(null);
        setErrorMessage('Class not found');
        setLoading(false);
        return;
      }

      setClassData(foundClass);

      const usersRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/users?page=${page}&limit=10&role=student`
      );

      const users = usersRes.data.users || [];
      setTotalPages(usersRes.data.totalPages || 1);

      // ✅ FIX 2: safe access to students
      const enrolledStudentIds =
        foundClass?.students?.map(s => s._id) || [];

      const availableStudents = users.filter(
        user =>
          user.role === 'student' &&
          !enrolledStudentIds.includes(user._id)
      );

      setAllStudents(availableStudents);

    } catch (error) {

      console.error('Error fetching data:', error);

      setErrorMessage(
        'Failed to load data. Make sure the backend endpoint exists.'
      );

    } finally {
      setLoading(false);
    }
  };
  // pagination concept here
  // we fetch all students but only show a subset based on the current page
  // the backend should support pagination for the users endpoint to make this efficient

  const toggleStudentSelection = (studentId) => {

    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(
        selectedStudents.filter(id => id !== studentId)
      );
    } else {
      setSelectedStudents([
        ...selectedStudents,
        studentId
      ]);
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

      const enrollPromises = selectedStudents.map(
        studentId =>
          axios.post(
            `${import.meta.env.VITE_API_URL}/classes/enroll`,
            {
              classId,
              studentId
            }
          )
      );

      await Promise.all(enrollPromises);

      setSuccessMessage(
        `Successfully enrolled ${selectedStudents.length} student(s)!`
      );

      setSelectedStudents([]);

      setTimeout(() => {
        fetchClassAndStudents();
        setSuccessMessage('');
      }, 1500);

    } catch (error) {

      console.error('Error enrolling students:', error);

      setErrorMessage(
        error.response?.data?.message ||
        'Failed to enroll students'
      );

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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Enroll Students
        </h1>

        <p className="text-gray-600">
          Class:
          <span className="font-semibold"> {classData.name}</span>
          ({classData.code})
        </p>

        <p className="text-sm text-gray-500 mt-1">
          Currently enrolled: {classData.students?.length || 0} students
        </p>

      </div>

      {/* Messages */}
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

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

          <input
            type="text"
            placeholder="Search by name, student ID, or email..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">

        {filteredStudents.length === 0 ? (

          <div className="p-8 text-center">
            <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">
              {searchTerm ? 'No students found' : 'All students are enrolled'}
            </h3>
          </div>

        ) : (

          <>
            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-gray-200">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-12 px-6 py-3"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">

                  {filteredStudents.map(student => (
                    <tr
                      key={student._id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedStudents.includes(student._id)
                          ? 'bg-blue-50'
                          : ''
                      }`}
                      onClick={() => toggleStudentSelection(student._id)}
                    >

                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => toggleStudentSelection(student._id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>

                      <td className="px-6 py-4">{student.name}</td>
                      <td className="px-6 py-4">{student.studentId || 'N/A'}</td>
                      <td className="px-6 py-4">{student.email}</td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

            {/* 🔥 FIXED ENROLL BUTTON (THIS WAS YOUR MAIN ISSUE) */}
            <div className="flex justify-end p-4 border-t bg-gray-50">
              <button
                onClick={handleEnrollStudents}
                disabled={enrolling || selectedStudents.length === 0}
                className={`px-6 py-2 rounded-lg ${
                  enrolling || selectedStudents.length === 0
                    ? 'bg-gray-300'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {enrolling
                  ? 'Enrolling...'
                  : `Enroll Selected (${selectedStudents.length})`}
              </button>
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4 p-4 bg-gray-50">

              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>

              <span>Page {page} of {totalPages}</span>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>

            </div>

          </>
        )}

      </div>

    </div>
  );
};

export default EnrollStudents;
