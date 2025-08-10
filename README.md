# Trip Planner App

A comprehensive trip planning application that allows users to collaborate on planning trips, manage budgets, and get personalized recommendations.

## Features

### Core Features
- **Trip Planning**: Create trips with start/destination locations, dates, and preferences
- **AI-Powered Itinerary Generation**: Generate intelligent itineraries using Google Gemini 2.5 Flash Lite
- **Personalized Recommendations**: Get place suggestions based on user preferences and group interests
- **Collaborative Planning**: Invite friends to collaborate on trip planning
- **Group Chat**: Real-time messaging with polls, suggestions, and voting
- **Budget Management**: Track expenses, split costs, and manage budgets
- **User Preferences**: Customize travel preferences for better recommendations

### Technical Features
- Real-time collaboration with Socket.io
- JWT-based authentication
- Responsive design with Tailwind CSS
- MongoDB database with Mongoose ODM
- RESTful API with Express.js
- React frontend with modern hooks and context
- AI-powered itinerary generation with Google Gemini 1.5 Pro

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Socket.io** for real-time features
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Google Places API** for location data
- **Google Gemini 1.5 Pro** for AI-powered itinerary generation

### Frontend
- **React** with React Router
- **Tailwind CSS** for styling
- **Socket.io-client** for real-time features
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Places API key (optional, has fallback mock data)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trip-planner-app
   ```

2. **Quick Setup (Recommended)**
   ```bash
   # Install all dependencies
   npm run install-all
   
   # Setup environment files
   npm run setup
   ```

3. **Manual Environment Setup (Alternative)**
   
   Create `.env` file in the `server` directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/trip-planner
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # External APIs
GOOGLE_PLACES_API_KEY=your-google-places-api-key
GEMINI_API_KEY=your-gemini-api-key

# AI Configuration
GEMINI_MODEL=gemini-1.5-pro
   
   # Server Configuration
   PORT=5001
   CLIENT_URL=http://localhost:3000
   ```
   
   Create `.env` file in the `client` directory:
   ```env
   REACT_APP_SERVER_URL=http://localhost:5001
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/preferences` - Update user preferences

### Trips
- `GET /api/trips` - Get user's trips
- `POST /api/trips` - Create new trip
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/:id/members` - Add trip member
- `DELETE /api/trips/:id/members/:userId` - Remove trip member
- `POST /api/trips/:id/generate-itinerary` - Generate trip itinerary

### Budget
- `GET /api/budget/:tripId` - Get trip budget
- `POST /api/budget/:tripId` - Create/update budget
- `POST /api/budget/:tripId/expenses` - Add expense
- `PUT /api/budget/:tripId/expenses/:expenseId` - Update expense
- `DELETE /api/budget/:tripId/expenses/:expenseId` - Delete expense

### Group Chat
- `GET /api/groups/:tripId/messages` - Get chat messages
- `POST /api/groups/:tripId/messages` - Send message
- `POST /api/groups/:tripId/polls` - Create poll
- `POST /api/groups/:tripId/suggestions` - Create suggestion
- `POST /api/groups/:tripId/vote` - Vote on activity

### Places
- `GET /api/places/search` - Search places
- `GET /api/places/:placeId` - Get place details

## Socket.io Events

### Client to Server
- `join-trip` - Join trip room
- `leave-trip` - Leave trip room
- `send-message` - Send chat message
- `vote-activity` - Vote on activity
- `update-itinerary` - Update trip itinerary
- `update-budget` - Update budget

### Server to Client
- `new-message` - New chat message
- `activity-voted` - Activity vote update
- `itinerary-updated` - Itinerary change
- `budget-updated` - Budget change
- `member-joined` - New member joined
- `member-left` - Member left trip

## Project Structure

```
trip-planner-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── middleware/         # Custom middleware
│   ├── index.js            # Server entry point
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## Development

### Available Scripts

**Root directory:**
- `npm run dev` - Start both client and server
- `npm run server` - Start server only
- `npm run client` - Start client only

**Server directory:**
- `npm start` - Start server
- `npm run dev` - Start server with nodemon

**Client directory:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Database Models

- **User**: User accounts with preferences and contacts
- **Trip**: Trip information with itinerary and members
- **Budget**: Budget tracking with expenses and splits
- **Expense**: Individual expense records
- **Message**: Group chat messages with polls and suggestions

## Deployment

### Backend Deployment
1. Set up MongoDB Atlas or use your preferred MongoDB hosting
2. Configure environment variables for production
3. Deploy to your preferred platform (Heroku, Railway, etc.)

### Frontend Deployment
1. Update `REACT_APP_SERVER_URL` to your production API URL
2. Build the application: `npm run build`
3. Deploy to Netlify, Vercel, or your preferred hosting platform

## Troubleshooting

### AI Features Not Working
- **Issue**: "AI itinerary generation failed"
- **Solution**: 
  1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
  2. Add it to `server/.env` as `GEMINI_API_KEY=your-key-here`
  3. Restart the server
  4. The app will fall back to basic itinerary generation if AI is unavailable

### Location Autocomplete Not Working
- **Issue**: No location suggestions appear
- **Solution**:
  1. Get a Google Places API key from [Google Cloud Console](https://console.cloud.google.com/)
  2. Enable Places API in your Google Cloud project
  3. Add it to `server/.env` as `GOOGLE_PLACES_API_KEY=your-key-here`
  4. Restart the server
  5. The app will fall back to manual text input if Places API is unavailable

### Database Connection Issues
- **Issue**: "MongoDB connection error"
- **Solution**:
  1. Ensure MongoDB is running locally, or
  2. Use MongoDB Atlas (cloud) and update `MONGODB_URI` in `server/.env`
  3. Check your network connection

### Port Already in Use
- **Issue**: "Port 5001 is already in use"
- **Solution**:
  1. Change the port in `server/.env`: `PORT=5002`
  2. Update `client/.env`: `REACT_APP_SERVER_URL=http://localhost:5002`
  3. Restart both servers

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Future Enhancements

- [ ] Mobile app with React Native
- [ ] Offline support with PWA
- [ ] Push notifications
- [ ] Advanced map integration
- [ ] Trip sharing and social features
- [ ] Integration with booking platforms
- [ ] AI-powered recommendations
- [ ] Multi-language support
