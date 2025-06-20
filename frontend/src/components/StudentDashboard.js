import { useEffect, useState } from 'react';
import { socket } from '../socket/socket';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [newMsg, setNewMsg] = useState('');
  const [tab, setTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState([]);
  const [pollResults, setPollResults] = useState(null);
  const [participants, setParticipants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleChat = ({ sender, message, time , isTeacher }) => {
      setChatMessages((prev) => [...prev, { sender, message, time , isTeacher}]);
    };

    const handleParticipantsUpdate = (data) => {
      setParticipants(data); 
    };
    const handleCurrentPoll = (data) => {
      if (data) {
        setPoll({ question: data.question, options: data.options });
        setTimeLeft(data.timeLeft);
        setSubmitted(data.hasAnswered);
        setSelected(data.selectedAnswer);
      }
    };
    socket.on('current_poll', handleCurrentPoll);
    socket.on('participants_update', handleParticipantsUpdate);
    socket.emit('show_participants');
    socket.on('receive_chat', handleChat);
    return () => {
      socket.off('receive_chat', handleChat);
      socket.off('participants_update', handleParticipantsUpdate);
      socket.off('current_poll', handleCurrentPoll);
    };
  }, []);

  console.log(chatMessages);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const sendMessage = () => {
    if (newMsg.trim()) {
      socket.emit('send_chat', { message: newMsg });
      setNewMsg('');
    }
  };

  if (!socket.connected) socket.connect();

  useEffect(() => {
    console.log('Connecting to socket...');
    socket.emit('get_current_poll');

    socket.on('poll_started', ({ question, options, duration }) => {
      setPoll({ question, options });
      setTimeLeft(duration);
      setSubmitted(false);
    });

    socket.on('kicked', (message) => {
      console.log(message); // Optional: show a toast or log
      navigate('/kicked');  // Redirect user to kicked page
    });


    socket.on('poll_results', (data) => {
      setPollResults(data);
    });

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const submitAnswer = () => {
    if (selected) {
      if (!socket.connected) socket.connect();
      console.log('Submitting answer:', selected);
      socket.emit('answer_poll', selected);
      setSubmitted(true);
    }
  };

  if (!poll) {
    return (
      <div className="h-screen flex items-center justify-center text-xl font-semibold">
        <span className="animate-pulse text-purple-600">Wait for the teacher to ask questions..</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {
        !pollResults ?
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-2xl">
              {/* Question Header with Timer */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Question 1</h1>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-500 font-bold text-lg">{formatTime(timeLeft)}</span>
                </div>
              </div>

              {/* Question Box */}
              <div className="bg-gray-700 text-white p-6 rounded-lg mb-8">
                <p className="text-lg font-medium">{poll.question}</p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {poll.options.map((option, idx) => (
                  <button
                    key={option}
                    onClick={() => !submitted && setSelected(option)}
                    disabled={submitted}
                    className={`w-full text-left px-4 py-4 border-2 rounded-lg transition-all duration-200 flex items-center gap-3 ${selected === option
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                      } ${submitted ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${selected === option ? 'bg-purple-600' : 'bg-gray-400'
                      }`}>
                      {idx + 1}
                    </div>
                    <span className="text-gray-800 font-medium">{option}</span>
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              {!submitted && (
                <div className="text-center">
                  <button
                    onClick={submitAnswer}
                    disabled={!selected}
                    className={`px-8 py-3 rounded-full font-semibold transition-all duration-200 ${selected
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    Submit
                  </button>
                </div>
              )}

              {submitted && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-full font-semibold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Answer Submitted!
                  </div>
                </div>
              )}
            </div>
          </div>
          :
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-2xl">
              <h2 className="text-2xl font-bold mb-8 text-gray-800">Question</h2>

              <div className="bg-gray-700 text-white p-4 rounded-lg mb-8 font-medium">
                {pollResults.question}
              </div>

              <div className="space-y-4">
              {(() => {
                const maxCount = Math.max(
                  ...Object.values(pollResults.results).map((r) => r.count)
                );
                return Object.entries(pollResults.results).map(
                  ([option, { count, percentage }], index) => {
                    const isWinner = count === maxCount && count > 0;
                    return (
                      <div key={index} className="relative">
                        <div className="flex items-center mb-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${
                              isWinner ? 'bg-purple-600' : 'bg-gray-400'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="text-gray-700 font-medium">{option}</span>
                        </div>

                        <div className="ml-9">
                          <div className="w-full bg-gray-200 rounded-lg h-8 relative overflow-hidden">
                            <div
                              className={`h-full rounded-lg transition-all duration-500 ${
                                isWinner ? 'bg-purple-600' : 'bg-gray-400'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-600">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                );
              })()}
            </div>
            </div>
          </div>
      }

      {/* Chat Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${tab === 'chat'
              ? 'border-purple-600 text-purple-600 bg-purple-50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setTab('chat')}
          >
            Chat
          </button>
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${tab === 'participants'
              ? 'border-purple-600 text-purple-600 bg-purple-50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setTab('participants')}
          >
            Participants
          </button>
        </div>

        {tab === 'chat' ? (
          <div className="flex flex-col flex-1">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className="flex flex-col">
                  <div className={`max-w-xs break-words ${msg.isTeacher ? 'self-start' : 'self-end'
                    }`}>
                    <div className="text-xs text-gray-500 mb-1 font-medium">
                      {msg.sender}
                    </div>
                    <div className={`px-3 py-2 rounded-lg text-sm ${msg.isTeacher
                      ? 'bg-gray-800 text-white rounded-tl-none'
                      : 'bg-purple-600 text-white rounded-tr-none'
                      }`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMsg.trim()}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${newMsg.trim()
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
            <div className="flex-1 p-4 overflow-y-auto">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">Participants</h3>
    {participants.length === 0 ? (
      <p className="text-sm text-gray-500">No participants yet.</p>
    ) : (
      <ul className="space-y-2">
        {participants.map((p, idx) => (
          <li key={idx} className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg">
            <span className="text-sm font-medium text-gray-800">{p.name}</span>
            <span className="text-xs text-gray-500 capitalize">{p.role}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;