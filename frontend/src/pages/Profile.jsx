// src/pages/Profile.jsx
import { useContext } from 'react';
import { User, Mail, Award, Calendar } from 'lucide-react';
import AuthContext from '../context/AuthContext';


//What does this component do?
// This component displays the profile information of the currently logged-in user.
// It fetches user data from the AuthContext and presents details such as name, email, role, student ID, department, semester, and account creation
//  date.
// It provides a clean and organized layout for users to view their personal information.

//role of useContext here:
// The useContext hook is used to access the AuthContext, which holds the authenticated user's information.


const Profile = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-8">
          <div className="p-4 bg-blue-100 rounded-full">
            <User className="h-16 w-16 text-blue-600" />
          </div>
          <div className="ml-6">
            <h1 className="text-3xl font-bold text-gray-900">{user?.name || 'N/A'}</h1>
            <p className="text-gray-600 capitalize">{user?.role || 'N/A'}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center text-gray-700">
              <Mail className="h-5 w-5 mr-3 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {user?.studentId && (
            <div className="border-b pb-4">
              <div className="flex items-center text-gray-700">
                <Award className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Student ID</p>
                  <p className="font-medium">{user.studentId}</p>
                </div>
              </div>
            </div>
          )}

          {user?.department && (
            <div className="border-b pb-4">
              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{user.department}</p>
                </div>
              </div>
            </div>
          )}

          {user?.semester && (
            <div className="border-b pb-4">
              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Semester</p>
                  <p className="font-medium">{user.semester}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <div className="flex items-center text-gray-700">
              <Calendar className="h-5 w-5 mr-3 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Account Created</p>
                <p className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

