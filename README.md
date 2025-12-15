# Skill Swap - AI-Powered Skill Exchange Platform

Skill Swap is a modern web application designed to connect users for mutual skill learning. It leverages AI to enhance the learning experience and provides real-time collaboration tools.

## 🚀 Features

- **AI-Powered Assistance**: Integrated with Google Gemini for intelligent suggestions and help.
- **Real-Time Chat**: Seamless messaging between users.
- **Collaborative Whiteboard**: visual tool for explaining concepts in real-time.
- **User Networking**: Connect with others based on skills to teach and learn.
- **Admin Panel**: Comprehensive dashboard for user and platform management.
- **Authentication**: Secure login and signup using Firebase.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: CSS / Tailwind (if applicable)
- **State Management**: React Context / Hooks
- **Integrations**: Firebase (Auth), Google Gemini AI

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (Motor async driver)
- **Authentication**: Firebase Admin SDK
- **WebSockets**: For real-time chat and whiteboard features

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18+ recommended)
- **Python** (v3.9+ recommended)
- **MongoDB** (Running locally or a cloud instance URL)
- **Firebase Project** (With Auth and Firestore enabled)

## ⚙️ Installation & Setup

### 1. Backend Setup

The backend handles API requests, database interactions, and real-time features.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Create and activate a virtual environment:
    ```bash
    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

    # Windows
    python -m venv venv
    venv\Scripts\activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configuration**:
    - Ensure MongoDB is running (Default: `mongodb://localhost:27017`).
    - Place your Firebase Service Account JSON file in the `backend/` directory and name it `serviceAccountKey.json`.
    - (Optional) Create a `.env` file in `backend/` variables if needed (e.g., `MONGODB_URL`).

5.  **Initialize Admin User** (Optional but recommended):
    ```bash
    python admin_setup.py
    ```
    This script creates a default admin user (`admin@skillswap.com` / `admin1234`).

6.  **Run the Server**:
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    ```
    The API will be available at `http://localhost:8000`. API Docs at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

The frontend is the user interface for the application.

1.  Navigate to the project root (if not already there):
    ```bash
    cd ..
    # or ensure you are in the 'skill-swap-google-aistudio' directory
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Configuration**:
    - Create a `.env.local` file in the root directory.
    - Add your Gemini API Key:
      ```env
      VITE_GEMINI_API_KEY=your_gemini_api_key_here
      ```
      *(Note: Check the code for the exact variable name expected for the Gemini Key, usually `VITE_` prefix is required for Vite).*

4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch.
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.
