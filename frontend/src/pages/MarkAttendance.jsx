//frontend/src/pages/MarkAttendance.jsx

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { CheckCircle, XCircle, QrCode } from 'lucide-react';
import { getBiometricAssertion } from '../utils/webauthn';

const MarkAttendance = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let scanner;

    if (scanning) {
      scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      });

      scanner.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanning]);

  const onScanSuccess = async (decodedText) => {
    try {
      const qrData = JSON.parse(decodedText);

      // Try biometric verification, but don't block attendance if it fails
      // or if the student hasn't enrolled a device yet (Option A rollout —
      // this is optional for now, will become mandatory later).
      let biometricAssertion;
      try {
        biometricAssertion = await getBiometricAssertion(qrData.sessionId);
      } catch (err) {
        biometricAssertion = undefined;
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/attendance/mark`, {
        sessionId: qrData.sessionId,
        qrCode: qrData.qrCode,
        biometricAssertion,
      });

      setResult({ success: true, message: response.data.message });
      setScanning(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
      setResult({ success: false, message: err.response?.data?.message });
      setScanning(false);
    }
  };

  const onScanFailure = (error) => {
    // Ignore scan failures, they happen frequently
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center mb-6">
          <QrCode className="h-12 w-12 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
        </div>

        {!scanning && !result && (
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Click the button below to scan the QR code displayed by your instructor
            </p>
            <button
              onClick={() => setScanning(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Start QR Scanner
            </button>
          </div>
        )}

        {scanning && (
          <div>
            <div id="qr-reader" className="mb-4"></div>
            <button
              onClick={() => setScanning(false)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Cancel Scanning
            </button>
          </div>
        )}

        {result && (
          <div className={`p-6 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center justify-center mb-4">
              {result.success ? (
                <CheckCircle className="h-16 w-16 text-green-600" />
              ) : (
                <XCircle className="h-16 w-16 text-red-600" />
              )}
            </div>
            <p className={`text-center text-lg font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.message}
            </p>
            <button
              onClick={() => {
                setResult(null);
                setError('');
              }}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Scan Another QR Code
            </button>
          </div>
        )}

        {error && !result && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
            <li>Make sure you are in the correct class session</li>
            <li>Position your device camera to scan the QR code</li>
            <li>If you've set up biometric verification, confirm with your fingerprint/Face ID when prompted</li>
            <li>You can only mark attendance once per session</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;