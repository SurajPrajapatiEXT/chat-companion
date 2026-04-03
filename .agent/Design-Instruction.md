Build a simple but production-ready chatbot web app using React + TypeScript with clean architecture, responsive UI, and separate mobile/desktop-friendly layouts.

Requirements:
- Use React + TypeScript
- Use a modern tooling setup like Vite
- Use React Router for navigation
- Use a clean folder structure
- Use environment variables via .env for BASE_URL
- Use a red / white / black theme:
  - Primary: Red
  - Text: White
  - Background: Black
- Make the app responsive with clearly optimized layouts for mobile and desktop
- Keep the UI simple, modern, and easy to use

Main Features:
1. Authentication
- First page must be a Login page
- Login form fields:
  - username
  - password
- Use the existing login API for validation
- On successful login, store these values:
  - username/name
  - profilePic URL
  - role
  - email
  - token
  - expiresIn if useful
- Store auth data securely in localStorage or another practical client-side approach
- After successful login, redirect to Dashboard
- If user is not logged in and tries to access any protected page, redirect to Login
- Add logout functionality that clears auth and sends user back to Login

2. Dashboard Layout
- After login, land on the Dashboard
- Dashboard layout:
  - Left sidebar/menu
  - Main chat content area
  - User profile picture on the right/top-right
- Sidebar menu items:
  - New Chat
  - History
  - Account Info
  - Logout
- Clicking profile picture can also open account info or keep focus on new chat view

3. Chat Window
- Default landing view after login should open a New Chat window
- Chat window requirements:
  - Message list area
  - Input box fixed at bottom
  - Small send icon/button on the right side of input
  - Text-only input for now
  - Speech-to-text can be marked as future enhancement, not implemented now
- User can type a question and send it
- On send:
  - Call chat API
  - Save interaction history into IndexedDB
- Show conversation in a simple chat UI with user and bot messages

4. History
- History page/panel should list previous chats
- Show only:
  - title
  - date, or time if the interaction happened today
- Clicking a history item should reopen that conversation in the chat window
- Load previous conversation from IndexedDB
- If needed, use localStorage only for lightweight metadata, but actual chat interactions should be stored in IndexedDB

5. Account Page
- Account Info page should display full stored user details:
  - profile picture
  - username
  - email
  - role
  - any other useful fields from login response
- Keep it visually consistent with the app theme

API Integration:
1. Login API
Endpoint:
{BASE_URL}/api/v1/Auth/login

Example request:
curl --location '{BASE_URL}/api/v1/Auth/login' \
--header 'Content-Type: application/json' \
--data '{
  "username": "Admin",
  "password": "admin"
}'

Example response:
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "suraj@test.com",
    "role": "Admin",
    "profilePic": "https://localhost:7084/img/profilepic/90a2956758184630a56d3ee6a383f5c9.jpg",
    "isFirstLogin": true,
    "createdAt": "2025-12-07T18:10:45.12"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5***********8rMc",
  "expiresIn": 3600
}

2. Chat API
Endpoint:
{BASE_URL}/api/v1/interakt/chat-ai

Example request:
curl --location '{BASE_URL}/api/v1/interakt/chat-ai' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <TOKEN>' \
--data '{
  "mobile": "{MobileNo}",
  "name": "{Name}",
  "instructionKey": "instruction_force_to_visit_gym",
  "message": "Hi",
  "data": ""
}'

Chat API rules:
- message = current user input
- data = previous history/context pulled from IndexedDB or built from stored chat interaction data
- instructionKey should be fixed to:
  instruction_force_to_visit_gym
- Authorization header must use stored token
- mobile and name should come from available user/app data; if mobile is not available from login response, define a safe placeholder strategy and clearly mention it in code comments

Technical Expectations:
- Use TypeScript types/interfaces for API request and response models
- Create reusable components
- Add route guards / protected routes
- Create a simple API service layer
- Use IndexedDB for chat history persistence
- Handle loading, empty state, and API error state
- Add basic form validation for login
- Add simple UX improvements like disabled submit/send while loading
- Keep code maintainable and beginner-friendly

Suggested Pages / Components:
- LoginPage
- DashboardPage
- ChatWindow
- Sidebar
- HistoryList
- AccountPage
- ProtectedRoute
- API service utilities
- IndexedDB utility/service
- Theme/styles setup

Data Storage Expectations:
- Auth/user session: localStorage
- Chat interactions/history: IndexedDB
- Each chat session should have:
  - id
  - title
  - createdAt
  - updatedAt
  - messages array
- Title can be generated from the first user message

Implementation Details:
- Include a practical project folder structure
- Include full code for main files
- Include routing setup
- Include state management approach using React hooks and context; avoid overcomplicating with Redux unless truly necessary
- Use clean CSS, CSS modules, SCSS, Tailwind, or styled-components, but choose one and keep it consistent
- If you choose a UI library, keep it lightweight; otherwise build custom components

Important Behavior Rules:
- If no login token exists, redirect to login on every protected route
- On app load, restore auth state from storage
- On logout, clear auth and chat-related session state as needed
- Opening the app after login should go to dashboard/new chat
- History item click should restore previous conversation exactly
- The app should be fully usable on both mobile and desktop

What to deliver:
1. A complete working React + TypeScript implementation
2. Folder structure
3. All major source files with code
4. Setup instructions
5. .env example
6. Explanation of how IndexedDB is used
7. Explanation of auth flow and protected routing
8. Any assumptions clearly listed

Keep the solution simple, clean, and realistic. Avoid unnecessary complexity, but make it complete and runnable