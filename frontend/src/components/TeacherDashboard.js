import { useState } from 'react';
import { socket } from '../socket/socket';
import { useNavigate } from 'react-router-dom';

export default function TeacherPoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctAnswers, setCorrectAnswers] = useState([false, false]);
  const [duration, setDuration] = useState(60);
  const navigate = useNavigate();

  const handleOptionChange = (value, idx) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  const handleCorrectChange = (idx, isCorrect) => {
    const newCorrect = [...correctAnswers];
    newCorrect[idx] = isCorrect;
    setCorrectAnswers(newCorrect);
  };

  const addOption = () => {
    setOptions([...options, '']);
    setCorrectAnswers([...correctAnswers, false]);
  };

  const sendPoll = () => {
    const filteredOptions = options.filter((opt) => opt.trim() !== '');
    if (!question.trim() || filteredOptions.length < 2) return alert("Enter question and minimum 2 options");
    if (!socket.connected) socket.connect();

    socket.emit('new_poll', {
      question,
      options: filteredOptions,
      duration,
    });

    setQuestion('');
    setOptions(['', '']);
    setCorrectAnswers([false, false]);
    console.log('Poll sent');
    navigate('/teacher/poll');
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Let’s <span className="text-purple-600">Get Started</span></h1>
      <p className="text-gray-500 mb-6">you’ll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.</p>

      <label className="block text-gray-700 font-semibold mb-2">Enter your question</label>
      <textarea
        rows="3"
        maxLength={100}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:outline-purple-500"
      />
      <div className="text-right text-xs text-gray-400 mb-4">{question.length}/100</div>

      <div className="flex items-center justify-between mb-4">
        <label className="font-semibold">Edit Options</label>
        <select
          className="border border-gray-300 rounded px-2 py-1"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
        >
          {[30, 45, 60, 90].map((d) => (
            <option key={d} value={d}>{d} seconds</option>
          ))}
        </select>
      </div>

      {options.map((opt, idx) => (
        <div key={idx} className="flex items-center mb-2 gap-4">
          <span className="w-5 text-center font-bold">{idx + 1}</span>
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
            value={opt}
            onChange={(e) => handleOptionChange(e.target.value, idx)}
          />
          <div className="flex items-center gap-2">
            <label className="text-sm">Is it Correct?</label>
            <label className="text-sm flex items-center gap-1">
              <input
                type="radio"
                checked={correctAnswers[idx] === true}
                onChange={() => handleCorrectChange(idx, true)}
              /> Yes
            </label>
            <label className="text-sm flex items-center gap-1">
              <input
                type="radio"
                checked={correctAnswers[idx] === false}
                onChange={() => handleCorrectChange(idx, false)}
              /> No
            </label>
          </div>
        </div>
      ))}

      <button
        onClick={addOption}
        className="text-purple-600 mt-2 mb-6 border border-purple-600 rounded-full px-4 py-1 text-sm hover:bg-purple-50"
      >
        + Add More option
      </button>

      <div className="text-right">
        <button
          onClick={sendPoll}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-full"
        >
          Ask Question
        </button>
      </div>
    </div>
  );
}
