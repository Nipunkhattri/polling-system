function socketHandler(io) {
    let activePoll = null;
    const students = new Map();
    const answered = new Set();
    let pollHistory = [];

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;

        if (!userId) {
            console.log("Connection rejected: No userId provided.");
            socket.disconnect();
            return;
        }
        socket.userId = userId; 
        socket.join(userId);    

        console.log(`User connected: userId=${userId}, socketId=${socket.id}`);

        // Set name and role
        socket.on('set_name', (data) => {
            if(students.has(userId)) {
                console.log(`User ${userId} already exists. Updating name and role.`);
                return;
            }
            students.set(userId, data);
            console.log(`${data.role} joined with name ${data.name}`);
            broadcastParticipants(io);
        });

        // Start new poll
        socket.on('new_poll', (poll) => {
            if (activePoll) {
                console.log('A poll is already active.');
                return;
            }

            activePoll = {
                question: poll.question,
                options: poll.options,
                answers: {},
                startedAt: new Date(),
                duration: poll.duration,
            };

            answered.clear();
            console.log(`New poll started: ${JSON.stringify(poll)}`);

            io.emit('poll_started', {
                question: activePoll.question,
                options: activePoll.options,
                duration: activePoll.duration,
            });

            setTimeout(() => {
                sendResults(io);
            }, poll.duration * 1000);
        });

        // Handle student answer
        socket.on('answer_poll', (answer) => {
            console.log(`Received answer from userId=${userId}: ${answer}`);
            if (!activePoll) return console.log('No active poll.');

            if (answered.has(userId)) {
                console.log(`${students.get(userId)?.name} already answered.`);
                return;
            }

            const user = students.get(userId);
            console.log(user);
            if (!user) return;

            activePoll.answers[user.name] = answer;
            answered.add(userId);

            console.log(`${user.name} answered: ${answer}`);

            if (answered.size === students.size) {
                sendResults(io);
            }
        });

        // Kick student
        socket.on('kick_student', (studentName) => {
            let idToKick = null;

            for (const [id, student] of students.entries()) {
            if (student.name === studentName) {
                idToKick = id;
                break;
            }
            }
            
            console.log(`Attempting to kick student: ${studentName}, ID: ${idToKick}`);

            if (idToKick) {
                console.log(`Kicking ${studentName}`);
                io.to(idToKick).emit('kicked', 'You have been kicked from the session.');
                students.delete(idToKick);
                answered.delete(idToKick);
                broadcastParticipants(io);
            } else {
                console.log(`Student ${studentName} not found.`);
            }
        });

        // Chat
        socket.on('send_chat', ({ message }) => {
            console.log(students);
            const user = students.get(userId);
            console.log(user);
            const isTeacher = user && user.role === 'Teacher';
            console.log(isTeacher);
            if (!user) return;
            const sender = user.name;
            const time = new Date().toLocaleTimeString();
            io.emit('receive_chat', { sender, message, time, isTeacher });
        });

        // Poll history
        socket.on('get_poll_history', () => {
            socket.emit('poll_history', pollHistory);
        });

        socket.on('show_participants', () => {
            broadcastParticipants(io)
        })

        // When a client asks for the current poll
        socket.on('get_current_poll', () => {
            console.log('Active poll requested by user:', userId);
            if (activePoll) {
                // Check if this user has answered
                const user = students.get(userId);
                const hasAnswered = answered.has(userId);
                const userName = user?.name;
                let selectedAnswer = null;
                if (userName && activePoll.answers[userName]) {
                    selectedAnswer = activePoll.answers[userName];
                }
                console.log(`User ${userName} requested current poll status.`);
                socket.emit('current_poll', {
                    question: activePoll.question,
                    options: activePoll.options,
                    duration: activePoll.duration,
                    startedAt: activePoll.startedAt,
                    hasAnswered,
                    selectedAnswer,
                    timeLeft: Math.max(
                        0,
                        activePoll.duration -
                        Math.floor((Date.now() - new Date(activePoll.startedAt).getTime()) / 1000)
                    ),
                });
            }
        });

        socket.on('get_result',() => {
            console.log('Result requested by user:', userId);
            sendResults(io);    
        })

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userId} (${socket.id})`);
        });
    });

    function sendResults(io) {
        if (!activePoll) return;

        const resultCount = {};
        for (const opt of activePoll.options) {
            resultCount[opt] = 0;
        }

        for (const ans of Object.values(activePoll.answers)) {
            if (resultCount.hasOwnProperty(ans)) {
                resultCount[ans]++;
            }
        }

        const totalVotes = Object.values(activePoll.answers).length;

        const resultWithPercentage = {};
        for (const [option, count] of Object.entries(resultCount)) {
            const percentage = totalVotes === 0 ? 0 : ((count / totalVotes) * 100).toFixed(2);
            resultWithPercentage[option] = {
                count,
                percentage: Number(percentage)
            };
        }

        const resultData = {
            question: activePoll.question,
            results: resultWithPercentage,
            totalVotes,
            endedAt: new Date(),
        };

        io.emit('poll_results', resultData);
        pollHistory.push({ ...activePoll, result: resultData });

        activePoll = null;
        answered.clear();
    }

    function broadcastParticipants(io) {
        const participantList = [];
        console.log(students);
        for (const { name, role } of students.values()) {
            if (role === 'Teacher') continue;
            participantList.push({ name, role });
        }
        console.log(participantList);
        io.emit('participants_update', participantList);
    }
}

export default socketHandler;