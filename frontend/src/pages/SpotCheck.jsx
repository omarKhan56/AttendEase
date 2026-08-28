import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SpotCheck = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [className, setClassName] = useState('');
  const [roster, setRoster] = useState([]);
  const [confirmed, setConfirmed] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRoster();
  }, [classId]);

  const fetchRoster = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/spotcheck/roster/${classId}`
      );
      setClassName(data.className);
      setRoster(data.markedPresent);
    } catch (error) {
      console.error('Error fetching spot check roster:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (studentId) => {
    setConfirmed((prev) => {
      const next = new Set(prev);
      next.has(studentId) ? next.delete(studentId) : next.add(studentId);
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/spotcheck`, {
        classId,
        confirmedStudentIds: Array.from(confirmed),
      });
      navigate(`/classes/${classId}`);
    } catch (error) {
      console.error('Error submitting spot check:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading…</div>;

  const gap = roster.length - confirmed.size;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">{className} — spot check</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-100 rounded-md p-4">
          <p className="text-sm text-gray-500">System marked present</p>
          <p className="text-2xl font-medium">{roster.length}</p>
        </div>
        <div className="bg-gray-100 rounded-md p-4">
          <p className="text-sm text-gray-500">You confirmed</p>
          <p className="text-2xl font-medium">{confirmed.size}</p>
        </div>
        <div className="bg-amber-50 rounded-md p-4">
          <p className="text-sm text-amber-700">Unaccounted for</p>
          <p className="text-2xl font-medium text-amber-700">{gap}</p>
        </div>
      </div>

      <div className="border rounded-md divide-y">
        {roster.map((s) => (
          <label key={s.studentId} className="flex items-center justify-between px-4 py-2">
            <span>{s.name} <span className="text-xs text-gray-500">({s.rollNumber})</span></span>
            <input
              type="checkbox"
              checked={confirmed.has(s.studentId)}
              onChange={() => toggle(s.studentId)}
            />
          </label>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Submit headcount'}
      </button>
    </div>
  );
};

export default SpotCheck;