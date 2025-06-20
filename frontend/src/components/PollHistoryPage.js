import { useEffect, useState } from 'react';
import { socket } from '../socket/socket';

export default function PollHistoryPage() {
  const [pollHistory, setPollHistory] = useState([]);

  useEffect(() => {
    socket.emit('get_poll_history');
    socket.on('poll_history', (data) => {
      setPollHistory(data);
    });

    return () => {
      socket.off('poll_history');
    };
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">
        View <span className="text-purple-600">Poll History</span>
      </h1>

      {pollHistory?.length === 0 ? (
        <p className="text-gray-500">No poll history available.</p>
      ) : (
        pollHistory.map((poll, index) => (
          <div key={index} className="mb-12">
            <h2 className="text-lg font-semibold mb-3">Question {index + 1}</h2>
            <div className="bg-gray-100 p-4 rounded-lg shadow-md border">
              <p className="font-medium text-gray-800 mb-4">{poll.question}</p>

              {poll.result?.results && Object.entries(poll.result.results).map(([option, { count, percentage }], i) => {
                const maxCount = Math.max(...Object.values(poll.result.results).map(r => r.count));
                const isWinner = count === maxCount && count > 0;

                return (
                  <div key={i} className="mb-3">
                    <div className="flex items-center mb-1">
                      <div
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-white font-bold text-sm mr-2 ${isWinner ? 'bg-purple-600' : 'bg-gray-400'}`}
                      >
                        {i + 1}
                      </div>
                      <span className="text-gray-800">{option}</span>
                    </div>
                    <div className="ml-8">
                      <div className="w-full bg-gray-300 rounded h-6 relative overflow-hidden">
                        <div
                          className={`h-full ${isWinner ? 'bg-purple-600' : 'bg-gray-500'} transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-white">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
