# viOra - Mood-Based Music App

A full-stack music streaming application that uses AI to detect facial expressions and recommend music accordingly. Features a Spotify-inspired interface with YouTube as the primary streaming source.

## Features

### Core Music Player
- **YouTube Integration**: Search and stream music from YouTube
- **Smart Autoplay**: Automatically plays related songs when current song ends
- **Queue Management**: View and manage upcoming songs
- **Music Controls**: Play, pause, skip, and volume control

### AI Mood Detection
- **Facial Recognition**: Uses webcam to detect emotions (Happy, Sad, Angry, Neutral, etc.)
- **Smart Recommendations**: Maps emotions to music categories
- **Real-time Updates**: Dynamically updates playlists based on mood changes

### User Interface
- **Spotify-Inspired Design**: Modern, clean light theme interface
- **Geolocation Display**: Shows user's current city and country
- **Responsive Design**: Works on desktop and mobile devices

### User Features
- **Authentication**: Secure login and signup system
- **Playlists**: Create and manage personal playlists
- **History**: Track listening history
- **Favorites**: Like and save favorite songs

## Tech Stack

### Backend
- **Node.js** with Express.js (MVC Architecture)
- **MongoDB** for user data and playlists
- **JWT** for authentication
- **YouTube Data API v3** for music streaming

### Frontend
- **EJS** for server-side rendering
- **Vanilla JavaScript** with modern ES6+ features
- **CSS3** with animations and transitions
- **face-api.js** for emotion detection

### AI & APIs
- **YouTube Data API v3** for music search and streaming
- **YouTube IFrame Player API** for playback
- **face-api.js** for facial expression recognition
- **IP Geolocation API** for location detection

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- YouTube Data API v3 key

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd viOra
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/viora
   YOUTUBE_API_KEY=your_youtube_api_key_here
   SESSION_SECRET=viora_secret_key
   ```

4. **YouTube API Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable YouTube Data API v3
   - Create credentials (API Key)
   - Copy the API key to your `.env` file

5. **Start MongoDB**
   ```bash
   # For local MongoDB
   mongod
   ```

6. **Run the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Or production mode
   npm start
   ```

7. **Access the app**
   Open your browser and navigate to `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Music
- `GET /api/music/search?q=query` - Search for music
- `GET /api/music/related/:videoId` - Get related songs
- `GET /api/music/details/:videoId` - Get video details
- `GET /api/music/mood/:mood` - Get mood-based playlist

## Mood Detection Mapping

| Emotion | Music Category | Search Terms |
|---------|----------------|--------------|
| Happy | Upbeat/Pop | "upbeat pop dance energetic cheerful" |
| Sad | Lofi/Chill | "lofi chill acoustic slow emotional" |
| Angry | Rock/Metal | "rock metal heavy intense powerful" |
| Neutral | Indie/Alternative | "indie alternative chill relaxed" |
| Surprised | Party/Celebration | "exciting upbeat party celebration" |
| Disgusted | Ambient/Meditation | "calm peaceful ambient meditation" |
| Fearful | Soothing/Relaxing | "calm soothing gentle relaxing" |

## Project Structure

```
viOra/
|
?? config/
|   ?? db.js              # Database connection
|
?? controllers/
|   ?? authController.js  # Authentication logic
|   ?? musicController.js # Music API logic
|
?? middleware/
|   ?? auth.js           # Authentication middleware
|
?? models/
|   ?? User.js           # User schema and model
|
?? routes/
|   ?? authRoutes.js     # Authentication routes
|   ?? indexRoutes.js    # Main page routes
|   ?? musicRoutes.js    # Music API routes
|
?? public/               # Static assets (CSS, JS, images)
|
?? views/
|   ?? index_enhanced.ejs # Main music player interface
|   ?? login.ejs         # Login page
|   ?? signup.ejs        # Signup page
|
?? .env                  # Environment variables
?? package.json          # Dependencies and scripts
?? server.js             # Main application entry point
```

## Usage

### Basic Music Playback
1. Use the search bar to find songs
2. Click on any song to play it
3. Use the player controls to manage playback
4. Related songs are automatically added to the queue

### Mood Detection
1. Click "Start Mood Sync" in the sidebar
2. Allow camera access when prompted
3. The app will detect your facial expressions
4. Music recommendations update based on your mood
5. Click "Stop Mood Sync" to disable

### Managing Queue
- View upcoming songs in the "Up Next" section
- Songs are automatically added from related videos
- Queue persists during the session

## Troubleshooting

### Common Issues

**YouTube API Errors**
- Verify your API key is correct in `.env`
- Check if you've exceeded the daily quota (10,000 units)
- Ensure YouTube Data API v3 is enabled in Google Cloud Console

**Camera Permission Denied**
- Ensure you're accessing via `localhost` (browsers block cameras on non-secure sites)
- Check browser permissions for camera access
- Try refreshing the page and granting permission again

**MongoDB Connection Issues**
- Verify MongoDB is running
- Check the `MONGO_URI` in your `.env` file
- Ensure MongoDB is accessible from your application

**Blank Screen or Loading Issues**
- Check browser console (F12) for JavaScript errors
- Verify all API endpoints are responding correctly
- Ensure all dependencies are installed

### Performance Tips

- **API Rate Limiting**: The app implements debouncing for search to avoid excessive API calls
- **Caching**: Recent searches and recommendations are cached in memory
- **Lazy Loading**: Components load as needed to improve initial load time

## Development

### Adding New Features
1. Update controllers in `/controllers/`
2. Add routes in `/routes/`
3. Update models in `/models/` if needed
4. Modify views in `/views/`

### Testing
```bash
# Run tests (if implemented)
npm test
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **YouTube Data API** for providing music streaming capabilities
- **face-api.js** for facial emotion recognition
- **Spotify** for UI design inspiration
- **MongoDB** for data storage solution

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify environment configuration
4. Check API key permissions and quotas

---

**Enjoy your personalized music experience with viOra! ??**
