# UFC Gym Chatbot

A production-ready chatbot web application built with React + TypeScript, featuring authentication, chat functionality, history tracking, and account management. Designed with a red/white/black theme and fully responsive layouts for mobile and desktop.

## 🎯 Project Goal

To create a simple but production-ready chatbot web app for UFC Gym members that allows users to:
- Authenticate securely with username/password
- Interact with an AI chatbot for gym-related inquiries
- View and manage chat history
- Access account information
- Enjoy a clean, modern UI optimized for both mobile and desktop devices

## 🛠️ Technical Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite (modern, fast development experience)
- **Routing**: React Router v6
- **State Management**: React Hooks and Context API
- **Styling**: CSS Modules (consistent with red/white/black theme)
- **Data Storage**: 
  - Auth data: localStorage
  - Chat history: IndexedDB
- **API Communication**: Fetch/Axios with JWT authentication
- **Development**: ESLint, Prettier for code quality

## 📁 Folder Structure

```
src/
├── assets/                 # Static assets (images, icons)
├── components/             # Reusable UI components
│   ├── layout/             # Layout components (Sidebar, Header, etc.)
│   ├── ui/                 # Generic UI components (Button, Input, etc.)
│   └── chat/               # Chat-specific components
├── contexts/               # React context providers (AuthContext, etc.)
├── hooks/                  # Custom React hooks
├── pages/                  # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── ChatWindow.tsx
│   ├── HistoryPage.tsx
│   └── AccountPage.tsx
├── services/               # API service layer
├── store/                  # State management (if using Redux/Zustand)
├── utils/                  # Utility functions (IndexedDB helpers, etc.)
├── types/                  # TypeScript interfaces and types
├── App.tsx                 # Main App component
├── main.tsx                # Entry point
├── index.css               # Global styles
└── vite-env.d.ts           # Vite TypeScript declarations

public/
├── index.html              # HTML template
└── vite.svg                # Vite logo

.env.example                # Environment variables example
.eslintrc.js                # ESLint configuration
.prettierrc                 # Prettier configuration
index.html                  # Main HTML file
package.json                # Dependencies and scripts
tsconfig.json               # TypeScript configuration
vite.config.ts              # Vite configuration
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher) or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ufc-gym-chatbot
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your BASE_URL
   ```

### Environment Variables

Create a `.env` file in the root directory with:

```env
VITE_BASE_URL=https://your-api-domain.com
```

> **Note**: The `VITE_` prefix is required for Vite to expose the variable to the client-side code.

### Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build the application for production:

```bash
npm run build
# or
yarn build
```

Preview the production build:

```bash
npm run preview
# or
yarn preview
```

### Linting and Formatting

Check for linting errors:

```bash
npm run lint
```

Fix linting errors:

```bash
npm run lint:fix
```

Format code with Prettier:

```bash
npm run format
```

## 👨‍💻 Developer Setup

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent naming conventions
- Write self-documenting code with meaningful variable/function names
- Keep components small and focused

### Available Scripts

In `package.json`:

- `dev` - Start development server
- `build` - Build for production
- `preview` - Preview production build
- `lint` - Run ESLint
- `lint:fix` - Fix ESLint auto-fixable issues
- `format` - Format code with Prettier
- `test` - Run tests (when implemented)

### State Management

The application uses React Context API for state management:
- `AuthContext` - Manages user authentication state
- Additional contexts can be added as needed

### Styling Approach

- CSS Modules for scoped styling
- Consistent red/white/black theme:
  - Primary: Red (#FF0000 or similar)
  - Text: White (#FFFFFF)
  - Background: Black (#000000)
- Responsive design with mobile-first approach

## 🔌 API Integration

### Authentication API

**Login Endpoint**
```
POST {BASE_URL}/api/v1/Auth/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": number,
    "username": string,
    "email": string,
    "role": string,
    "profilePic": "string (URL)",
    "isFirstLogin": boolean,
    "createdAt": "string (ISO date)"
  },
  "token": "string (JWT)",
  "expiresIn": number (seconds)
}
```

### Chat API

**Chat Endpoint**
```
POST {BASE_URL}/api/v1/interakt/chat-ai
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mobile": "string (from user data or placeholder)",
  "name": "string (from user data)",
  "instructionKey": "instruction_force_to_visit_gym",
  "message": "string (current user input)",
  "data": "string (chat history/context from IndexedDB)"
}
```

**Response:** AI-generated response based on the instruction key and conversation context.

### Authentication Flow

1. User submits login credentials on LoginPage
2. Application calls login API with username/password
3. On successful response:
   - Store user data and token in localStorage
   - Set auth state in AuthContext
   - Redirect to Dashboard
4. On subsequent visits:
   - Check localStorage for auth data on app load
   - Restore auth state if valid token exists
   - Redirect to Login if no valid token
5. Protected routes check for valid token and redirect to Login if missing/invalid
6. Logout clears auth data and redirects to Login

### Token Handling

- JWT token stored in localStorage
- Token sent in Authorization header for protected API calls
- Automatic token refresh logic can be implemented as needed
- Token expiration handled via expiresIn value

## 💾 Data Storage

### Authentication Data (localStorage)

Stored as JSON object:
```json
{
  "user": {
    "id": number,
    "username": string,
    "email": string,
    "role": string,
    "profilePic": "string",
    "isFirstLogin": boolean,
    "createdAt": "string"
  },
  "token": "string",
  "expiresIn": number
}
```

### Chat History (IndexedDB)

Database name: `ufcGymChatDb`
Object store: `chatSessions`

Each chat session has:
```typescript
interface ChatSession {
  id: string;              // Unique identifier (UUID or timestamp-based)
  title: string;           // Generated from first user message or "New Chat"
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
  messages: ChatMessage[]; // Array of messages
}

interface ChatMessage {
  id: string;              // Unique identifier
  content: string;         // Message text
  sender: 'user' | 'bot';  // Who sent the message
  timestamp: string;       // ISO timestamp
}
```

### Storage Strategy

- Auth data in localStorage for simplicity and accessibility
- Chat interactions in IndexedDB for:
  - Better performance with larger datasets
  - Ability to store complex objects
  - Offline capability potential
  - Larger storage limits compared to localStorage

## 🔒 Security Considerations

### Authentication Security

- JWT tokens stored in localStorage (with XSS mitigation considerations)
- HTTPS required for production deployment
- Token validation on client-side (expiration check)
- Route protection prevents unauthorized access to protected pages
- Passwords never stored or logged

### API Security

- All API calls require authentication token
- Input validation on login form (basic validation implemented)
- Authorization header properly set for chat API
- Error handling for API failures (network, 4xx, 5xx responses)

### Data Protection

- Sensitive data (token) not exposed in URL or console logs
- Chat data stored locally only (IndexedDB)
- No sensitive data sent to analytics or third parties without consent

### Frontend Security

- XSS prevention through proper escaping in React
- CSRF protection relies on same-origin policy for API calls
- Secure handling of user input to prevent injection

## 🧪 Testing Strategy

### Unit Testing

- Test individual components in isolation
- Test API service functions with mocked responses
- Test custom hooks with various scenarios
- Test utility functions (IndexedDB helpers, formatters, etc.)
- Tools: Jest + React Testing Library

### Integration Testing

- Test component interactions
- Test context providers and state flow
- Test API service integration with mocked backend
- Test routing and navigation flows

### End-to-End Testing (Future)

- Simulate user journeys (login → chat → history → logout)
- Test across different viewport sizes (mobile/desktop)
- Test error scenarios and edge cases
- Tools: Cypress or Playwright (to be implemented)

### Testing Guidelines

- Aim for 80%+ code coverage for critical paths
- Test both positive and negative cases
- Mock external dependencies (API calls, storage)
- Test responsive behavior with different screen sizes
- Include accessibility testing where possible

## 🚢 Deployment Guide

### Build Process

The application uses Vite for optimized builds:
```bash
npm run build
```
Outputs to `dist/` directory with:
- Minified JavaScript/CSS assets
- Optimized images and assets
- Production-ready HTML

### Environment Configuration

Different environments can be configured using:
- `.env.development` for development
- `.env.production` for production
- `.env.staging` for staging (if needed)

Vite automatically loads the appropriate file based on the mode.

### Deployment Platforms

#### Vercel
1. Push repository to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. Configure environment variables (VITE_BASE_URL)
4. Vercel automatically detects Vite setup and builds

#### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables in site settings

#### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize project: `firebase init`
3. Configure hosting public directory as `dist`
4. Deploy: `firebase deploy`

#### Docker (Containerized Deployment)
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Performance Optimization

- Code splitting via React.lazy() for route-based splitting
- Asset optimization through Vite's built-in optimizations
- Caching strategies for static assets
- Lazy loading of images where applicable
- Minimizing bundle size through tree-shaking

## 📱 Responsive Design

### Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Layout Adaptations

**Mobile:**
- Sidebar collapses to hamburger menu
- Chat window takes full width
- Profile picture accessible via menu
- Touch-friendly input controls

**Desktop:**
- Permanent sidebar navigation
- Chat window with fixed sidebar width
- Profile picture visible in header
- Hover effects and keyboard shortcuts

### CSS Approach

- Mobile-first media queries
- Flexible units (rem, %) for scalability
- Flexbox and Grid for layout
- Consistent spacing and typography scale

## 🧩 Assumptions Made

1. **Mobile Number**: Since the login API doesn't return a mobile number, we use a placeholder or derive it from user ID/email with clear documentation in code comments.

2. **Token Storage**: localStorage is used for auth data as specified, with awareness of XSS risks mitigated through React's automatic escaping and secure coding practices.

3. **IndexedDB Implementation**: A wrapper utility simplifies IndexedDB interactions, handling database versioning, object stores, and promise-based operations.

4. **API Availability**: The backend APIs (login and chat) are assumed to be available and functioning as specified in the documentation.

5. **Role-Based Access**: While not explicitly required, the role field from login response is stored and available for potential future role-based features.

6. **Session Persistence**: Auth session persists until explicit logout or token expiration, with automatic restoration on app load.

7. **Chat History Retrieval**: Previous conversations are loaded entirely from IndexedDB when accessing history or restoring a chat.

8. **Title Generation**: Chat session titles are auto-generated from the first user message (truncated if too long) with a fallback to "New Chat" or timestamp-based naming.

## 🔮 Future Enhancements

### Planned Features (from Documentation)

- **Speech-to-text**: Marked as future enhancement in chat input
- **File attachments**: Allow users to share images/documents with chatbot
- **Message reactions**: Enable users to react to messages with emojis

### Technical Improvements

- **State Management Migration**: Evaluate Zustand or Redux Toolkit for complex state logic
- **Internationalization**: Add i18n support for multiple languages
- **Advanced Caching**: Implement service workers for offline capabilities
- **Analytics**: Add privacy-compliant usage analytics
- **Accessibility**: Improve WCAG compliance (ARIA labels, keyboard navigation, color contrast)

### UI/UX Enhancements

- **Dark/Light Theme Toggle**: Allow users to switch between themes
- **Customizable Avatars**: Let users upload/profile pictures
- **Message Editing/Deletion**: Allow users to edit or remove their messages
- **Typing Indicators**: Show when bot is responding
- **Read Receipts**: Indicate when messages have been read
- **Chat Export**: Allow users to export chat history

### Backend Integrations

- **WebSocket Connection**: Real-time updates for faster chat experience
- **Push Notifications**: Notify users of new messages when app is inactive
- **Analytics Integration**: Track usage patterns (anonymized)
- **Third-party Auth**: Add social login options (Google, Apple, etc.)

## 📞 Support and Contribution

### Getting Help

- Check the documentation in this README
- Review inline code comments for complex logic
- Refer to the Design-Instruction.md for original specifications

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Review Process

- All PRs require review before merging
- Follow existing code style and patterns
- Include tests for new functionality
- Update documentation as needed
- Ensure linting passes before submission

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- UFC Gym for providing the API specifications
- The open-source community for React, TypeScript, Vite, and related tools
- Contributors who help improve this application

---

*Last updated: April 3, 2026*
*Version: 1.0.0*