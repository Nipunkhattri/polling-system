import { Link } from 'react-router-dom';

export default function KickedPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center">
        <Link
          to="/"
          className="inline-block mb-4 bg-purple-600 text-white px-4 py-1 rounded-full text-sm hover:bg-purple-700 transition"
        >
          ✦ Intervue Poll
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You’ve been Kicked out !</h1>
        <p className="text-sm text-gray-600">
          Looks like the teacher had removed you from the poll system. Please try again sometime.
        </p>
      </div>
    </div>
  );
}
