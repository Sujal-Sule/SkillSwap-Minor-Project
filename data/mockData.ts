import type { User, Skill, Message, Session, Rating, ConnectionRequest, TokenTransaction } from '../types';

export const skills: Skill[] = [
    { id: 's1', name: 'React', categoryId: 'c1' },
    { id: 's2', name: 'Python', categoryId: 'c1' },
    { id: 's3', name: 'UI/UX Design', categoryId: 'c2' },
    { id: 's4', name: 'Guitar', categoryId: 'c2' },
    { id: 's5', name: 'Creative Writing', categoryId: 'c2' },
    { id: 's6', name: 'Data Science', categoryId: 'c1' },
    { id: 's7', name: 'Project Management', categoryId: 'c3' },
    { id: 's8', name: 'Public Speaking', categoryId: 'c3' },
    { id: 's9', name: 'JavaScript', categoryId: 'c1' },
    { id: 's10', name: 'Node.js', categoryId: 'c1' },
    { id: 's11', name: 'AWS', categoryId: 'c1' },
    { id: 's12', name: 'Photography', categoryId: 'c2' },
    { id: 's13', name: 'Video Editing', categoryId: 'c2' },
    { id: 's14', name: 'Digital Marketing', categoryId: 'c3' },
    { id: 's15', name: 'Financial Planning', categoryId: 'c3' },
    { id: 's16', name: 'Yoga', categoryId: 'c4' },
    { id: 's17', name: 'Cooking', categoryId: 'c4' },
    { id: 's18', name: 'Personal Fitness', categoryId: 'c4' },
    { id: 's19', name: 'Advanced JavaScript', categoryId: 'c1' },
];

export const users: User[] = [
    {
        id: 'u1',
        name: 'Alex Thompson',
        avatarUrl: 'https://i.pravatar.cc/150?u=alex',
        bio: 'Frontend developer with 5 years of experience in the tech industry. Passionate about creating beautiful and intuitive user interfaces, especially with Advanced JavaScript.',
        teaches: [skills[0], skills[18]],
        learns: [skills[1], skills[4]],
        tokens: 10,
        connections: ['u2', 'u3', 'u4'],
        isOnline: true,
    },
    {
        id: 'u2',
        name: 'Maria Rodriguez',
        avatarUrl: 'https://i.pravatar.cc/150?u=maria',
        bio: 'Data scientist and Python enthusiast. I enjoy turning complex data into actionable insights. Looking to improve my JavaScript skills for a personal project.',
        teaches: [skills[1], skills[5]],
        learns: [skills[0], skills[18]],
        tokens: 5,
        connections: ['u1'],
        isOnline: true,
    },
    {
        id: 'u3',
        name: 'David Chen',
        avatarUrl: 'https://i.pravatar.cc/150?u=davidchen',
        bio: 'Musician and project manager. I believe creativity and organization go hand-in-hand. Let\'s learn together!',
        teaches: [skills[3], skills[6]],
        learns: [skills[2], skills[5]],
        tokens: 8,
        connections: ['u1'],
        isOnline: false,
    },
    {
        id: 'u4',
        name: 'Priya Sharma',
        avatarUrl: 'https://randomuser.me/api/portraits/women/24.jpg',
        bio: 'Communication coach and aspiring designer. I help people find their voice and express their ideas clearly.',
        teaches: [skills[7]],
        learns: [skills[2], skills[3]],
        tokens: 12,
        connections: ['u1'],
        isOnline: false,
    },
    {
        id: 'u5',
        name: 'David Lee',
        avatarUrl: 'https://picsum.photos/seed/david/200',
        bio: 'Professional photographer and digital marketer. Capturing moments and building brands are my passions.',
        teaches: [skills[11], skills[13]],
        learns: [skills[0], skills[15]],
        tokens: 7,
        connections: [],
        isOnline: true,
    },
    // New Indian Profiles
    {
        id: 'u6',
        name: 'Aarav Gupta',
        avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        bio: 'Full Stack Developer specializing in MERN stack. I love building scalable web applications and teaching others how to code. Always learning new tech!',
        teaches: [skills[0], skills[9], skills[10]], // React, JS, Node
        learns: [skills[14], skills[7]], // Digital Marketing, Project Management
        tokens: 15,
        connections: [],
        isOnline: true,
    },
    {
        id: 'u7',
        name: 'Ishaan Verma',
        avatarUrl: 'https://randomuser.me/api/portraits/men/41.jpg',
        bio: 'Cinematographer and storyteller. I can help you master Video Editing and Photography to tell your own stories.',
        teaches: [skills[12], skills[13]], // Photography, Video Editing
        learns: [skills[0], skills[2]], // React, UI/UX
        tokens: 6,
        connections: [],
        isOnline: false,
    },
    {
        id: 'u8',
        name: 'Riya Singh',
        avatarUrl: 'https://randomuser.me/api/portraits/women/63.jpg',
        bio: 'Financial Consultant with a passion for teaching personal finance. I help people manage their money better.',
        teaches: [skills[14], skills[15]], // Digital Marketing, Financial Planning
        learns: [skills[16], skills[17]], // Yoga, Cooking
        tokens: 20,
        connections: [],
        isOnline: true,
    },
    {
        id: 'u9',
        name: 'Meera Nair',
        avatarUrl: 'https://randomuser.me/api/portraits/women/12.jpg',
        bio: 'Certified Yoga Instructor and Wellness Coach. I believe in a holistic approach to health. Let\'s find your balance.',
        teaches: [skills[16], skills[17], skills[18]], // Yoga, Cooking, Personal Fitness
        learns: [skills[1], skills[5]], // Python, Creative Writing
        tokens: 9,
        connections: [],
        isOnline: true,
    },
    // New Match for 'Python'
    {
        id: 'u10',
        name: 'Vikram Malhotra',
        avatarUrl: 'https://randomuser.me/api/portraits/men/86.jpg',
        bio: 'Senior Backend Engineer with a love for Python automation and data scripting. I can help you go from basics to advanced backend systems.',
        teaches: [skills[1], skills[9]], // Python, Node.js
        learns: [skills[11]], // Photography
        tokens: 18,
        connections: [],
        isOnline: true,
    }
];

const proposedSession: Session = {
    id: 'sess-proposal-1',
    studentId: 'u2',
    teacherId: 'u1',
    proposerId: 'u1',
    skill: skills[18],
    scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 48),
    status: 'proposed',
    duration: 60,
    cost: 5,
};

export const messages: Message[] = [
    {
        id: 'm1',
        senderId: 'u2',
        receiverId: 'u1',
        text: "Hey Alex! I saw your profile and I'm really interested in learning about 'Advanced JavaScript'. I'm working on a personal project and I'm a bit stuck.",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        messageType: 'text',
        isRead: false,
    },
    {
        id: 'm2',
        senderId: 'u1',
        receiverId: 'u2',
        text: "Hi Maria! Absolutely, I'd be happy to help. 'Advanced JavaScript' is one of my favorite topics. What specifically are you struggling with?",
        timestamp: new Date(Date.now() - 1000 * 60 * 4),
        messageType: 'text',
        isRead: true,
    },
    {
        id: 'm3',
        senderId: 'u2',
        receiverId: 'u1',
        text: "Great! Let's schedule something then. I'm free tomorrow afternoon or Friday morning. Would that work?",
        timestamp: new Date(Date.now() - 1000 * 60 * 2),
        messageType: 'text',
        isRead: false,
    },
    {
        id: 'm-ai-1',
        senderId: 'u1', // The suggestion is shown to the current user
        receiverId: 'u2',
        text: "Seems like you're discussing 'Advanced JavaScript'. Want to propose a session?",
        timestamp: new Date(Date.now() - 1000 * 60 * 1),
        messageType: 'ai_suggestion',
        isRead: true,
    },
    {
        id: 'm-proposal-1',
        senderId: 'u1',
        receiverId: 'u2',
        text: "Session Proposed!",
        timestamp: new Date(Date.now() - 1000 * 30),
        messageType: 'session_card',
        session: proposedSession,
        isRead: true,
    },
    {
        id: 'm-david-1',
        senderId: 'u3',
        receiverId: 'u1',
        text: 'Just sent over a proposal for the project management session.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        messageType: 'text',
        isRead: true,
    },
    {
        id: 'm-priya-1',
        senderId: 'u4',
        receiverId: 'u1',
        text: 'Can we reschedule for tomorrow? Something came up.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
        messageType: 'text',
        isRead: false,
    }
];

export const sessions: Session[] = [
    {
        id: 'sess1',
        studentId: 'u4',
        teacherId: 'u3',
        proposerId: 'u4',
        skill: skills[3],
        scheduledTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        status: 'completed',
        studentHasRated: true,
        teacherHasRated: false,
        duration: 60,
        cost: 5,
    },
    {
        id: 'sess2',
        studentId: 'u1',
        teacherId: 'u2',
        proposerId: 'u1',
        skill: skills[1],
        scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // In 3 days
        status: 'scheduled',
        studentHasRated: false,
        teacherHasRated: false,
        duration: 45,
        cost: 4,
    },
    proposedSession,
];

export const ratings: Rating[] = [
    {
        id: 'r1',
        sessionId: 'sess1',
        raterId: 'u4',
        ratedId: 'u3',
        stars: 5,
        feedback: 'David is an amazing guitar teacher! Very patient and explains concepts clearly. Highly recommend!',
    },
    {
        id: 'r2',
        sessionId: 'sess1',
        raterId: 'u3',
        ratedId: 'u4',
        stars: 4,
        feedback: 'Priya was a great student, very enthusiastic and eager to learn!',
    },
];

export const connectionRequests: ConnectionRequest[] = [
    { id: 'cr1', senderId: 'u2', receiverId: 'u1', status: 'accepted' },
    { id: 'cr2', senderId: 'u3', receiverId: 'u1', status: 'accepted' },
    { id: 'cr3', senderId: 'u4', receiverId: 'u1', status: 'accepted' },
];

export const tokenTransactions: TokenTransaction[] = [
    {
        id: 'tt1',
        userId: 'u3',
        type: 'earned',
        amount: 1,
        description: 'Taught Guitar to Priya Sharma',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        sessionId: 'sess1',
    },
    {
        id: 'tt2',
        userId: 'u1',
        type: 'spent',
        amount: 1,
        description: 'Scheduled Python session with Maria Rodriguez',
        timestamp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        sessionId: 'sess2',
    }
];