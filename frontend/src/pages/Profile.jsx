// frontend/src/pages/Profile.jsx
import { useContext, useState } from 'react';
import { User, Mail, Award, Calendar, Fingerprint } from 'lucide-react'; // added Fingerprint
import AuthContext from '../context/AuthContext';
import { enrollDevice } from '../utils/webauthn'; // NEW

//What does this component do?
// This component displays the profile information of the currently logged-in user.
// It fetches user data from the AuthContext and presents details such as name, email, role, student ID, department, semester, and account creation
//  date.
// It provides a clean and organized layout for users to view their personal information.
// NEW: it also lets the user enroll this device for biometric attendance verification.

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState('');

  const handleEnroll = async () => {
    setEnrolling(true);
    setEnrollMessage('');
    try {
      await enrollDevice();
      setEnrollMessage('Device enrolled successfully. You can now use it to verify attendance.');
    } catch (err) {
      setEnrollMessage(err.message || 'Enrollment failed. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

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

          <div className="border-b pb-4">
            <div className="flex items-center text-gray-700">
              <Calendar className="h-5 w-5 mr-3 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Account Created</p>
                <p className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* NEW: biometric device enrollment */}
          <div className="pt-2">
            <div className="flex items-center text-gray-700 mb-3">
              <Fingerprint className="h-5 w-5 mr-3 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Biometric verification</p>
                <p className="font-medium">
                  {user?.webauthnCredentials?.length
                    ? `${user.webauthnCredentials.length} device(s) enrolled`
                    : 'No device enrolled yet'}
                </p>
              </div>
            </div>

            {user?.webauthnCredentials?.length > 0 && (
              <ul className="ml-8 mb-3 text-sm text-gray-600 list-disc list-inside">
                {user.webauthnCredentials.map((c, i) => (
                  <li key={c.credentialID || i}>
                    {c.label || 'My device'} — added{' '}
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {enrolling ? 'Enrolling…' : 'Set up biometric verification on this device'}
            </button>

            {enrollMessage && (
              <p className="mt-2 text-sm text-gray-600">{enrollMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;