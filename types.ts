import type React from 'react';

export interface Category {
    id: string;
    name: string;
    // FIX: Imported `React` to define the type for a functional component.
    icon: React.FC<{ className?: string }>;
    color: string; // e.g., 'sky', 'purple', 'emerald', 'rose'
}

export interface Skill {
    id: string;
    name: string;
    categoryId: string;
}

export interface User {
    id: string;
    name: string;
    avatarUrl: string;
    bio: string;
    teaches: Skill[];
    learns: Skill[];
    tokens: number;
    connections: string[]; // array of user IDs
    isOnline: boolean;
    isAdmin?: boolean;
    isSuspended?: boolean;
    email?: string; // Visible to admin
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    text: string;
    timestamp: Date;
    messageType: 'text' | 'ai_suggestion' | 'session_card';
    session?: Session;
    isRead: boolean;
}

export interface Session {
    id: string;
    studentId: string;
    teacherId: string;
    proposerId: string;
    skill: Skill;
    scheduledTime: Date;
    startedAt?: Date;
    status: 'proposed' | 'scheduled' | 'completed' | 'cancelled' | 'declined' | 'active';
    studentHasRated?: boolean;
    teacherHasRated?: boolean;
    duration: number; // in minutes
    cost: number; // in tokens
}

export interface Rating {
    id: string;
    sessionId: string;
    raterId: string;
    ratedId: string;
    stars: number;
    feedback: string;
}

export interface ConnectionRequest {
    id: string;
    senderId: string;
    receiverId: string;
    status: 'pending' | 'accepted' | 'declined';
}

export interface TokenTransaction {
    id: string;
    userId: string;
    type: 'earned' | 'spent';
    amount: number;
    description: string;
    timestamp: Date;
    sessionId?: string;
}

export interface Notification {
    id: string;
    userId: string;
    type: 'connection_request' | 'connection_accepted' | 'session_proposed' | 'session_scheduled' | 'session_cancelled' | 'new_match' | 'system';
    message: string;
    referenceId?: string;
    isRead: boolean;
    createdAt: string; // ISO string from backend
}
