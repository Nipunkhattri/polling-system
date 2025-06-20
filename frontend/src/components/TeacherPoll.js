import { useEffect, useState } from 'react';
import { socket } from '../socket/socket';
import { useNavigate } from 'react-router-dom';

export default function TeacherPoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(60);
  const [pollResults, setPollResults] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [tab, setTab] = useState('chat');
  const [participants, setParticipants] = useState([]);
  const navigate = useNavigate();

  if (!socket.connected) socket.connect();

  useEffect(() => {
    socket.on('poll_results', (data) => {
      setPollResults(data);
    });
    const handleChat = ({ sender, message, time, isTeacher }) => {
      setChatMessages((prev) => [...prev, { sender, message, time, isTeacher }]);
    };
    const handleParticipantsUpdate = (data) => {
      setParticipants(data);
    };

    socket.on('receive_chat', handleChat);
    socket.emit('show_participants');
    socket.on('participants_update', handleParticipantsUpdate);
    return () => {
      socket.off('receive_chat', handleChat);
      socket.off('participants_update', handleParticipantsUpdate);
    };
  }, []);

  const sendMessage = () => {
    if (!socket.connected) socket.connect();
    if (newMsg.trim()) {
      socket.emit('send_chat', { message: newMsg });
      setNewMsg('');
    }
  };

  const handleAskNewQuestion = () => {
    setPollResults(null);
    navigate('/teacher');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/poll-history')}
            className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium"
          >
            📊 View Poll History
          </button>
        </div>
        {pollResults ? (
          <div className="max-w-2xl">
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
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${isWinner ? 'bg-purple-600' : 'bg-gray-400'
                              }`}
                          >
                            {index + 1}
                          </div>
                          <span className="text-gray-700 font-medium">{option}</span>
                        </div>

                        <div className="ml-9">
                          <div className="w-full bg-gray-200 rounded-lg h-8 relative overflow-hidden">
                            <div
                              className={`h-full rounded-lg transition-all duration-500 ${isWinner ? 'bg-purple-600' : 'bg-gray-400'
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

            <button
              onClick={handleAskNewQuestion}
              className="mt-8 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              + Ask a new question
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Poll Result will be shared soon!!
            </h2>
          </div>
        )}
      </div>

      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className="flex flex-col">
                  <div className={`max-w-xs break-words ${msg.isTeacher ? 'self-start' : 'self-end'}`}>
                    <div className="text-xs text-gray-500 mb-1 font-medium">
                      {msg.sender}
                    </div>
                    <div
                      className={`px-3 py-2 rounded-lg text-sm ${msg.isTeacher
                        ? 'bg-gray-800 text-white rounded-tl-none'
                        : 'bg-purple-600 text-white rounded-tr-none'
                        }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
                  <li
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-800">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 capitalize">{p.role}</span>
                      {p.role === 'Student' && (
                        <button
                          onClick={() => socket.emit('kick_student', p.name)}
                          className="text-red-600 text-xs font-bold hover:underline"
                        >
                          Kick
                        </button>
                      )}
                    </div>
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