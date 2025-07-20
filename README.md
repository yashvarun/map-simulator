Vehicle Map Simulation
A responsive frontend-only web application that simulates a vehicle moving along a predefined route on an interactive map. It features smooth animations, real-time data display, and historical route viewing.

🚗 Live Demo: (Update with your GitHub Pages URL after deployment)

Features
Interactive Map: Utilizes Leaflet.js for a dynamic and zoomable map interface.

Smooth Vehicle Animation: The vehicle marker moves smoothly along the path using Leaflet.Marker.SlideTo.

Directional Vehicle Rotation: The car icon rotates to face the direction of movement, enhanced by Leaflet.RotatedMarker.

Polyline Direction Arrows: Arrows are displayed on the polyline to indicate the direction of travel, powered by Leaflet.PolylineDecorator.

Map Auto-Adjustment: The map automatically pans to keep the vehicle marker centered during playback.

Real-time Data Display: Shows current latitude, longitude, timestamp, and calculated speed.

Playback Controls: Intuitive "Play" and "Pause" buttons.

Time Scrubbing Slider: A slider allows users to manually scrub through the vehicle's journey at any point.

Historical Route Viewing: A "History" dropdown allows selecting and displaying unique routes for "Today," "Yesterday," and "Day before Yesterday."

Responsive & Modern UI: A clean, aesthetically pleasing toolbar design that adapts well to various screen sizes (desktop and mobile).

Setup
To get this project up and running on your local machine:

Clone the Repository:

git clone <your-repo-url>
cd vehicle-map-simulation

Prepare Image Asset:

Ensure you have your vehicle icon image (e.g., image_43138e.png) placed in an images/ folder at the root of your project. The script.js expects it at images/image_43138e.png.

Prepare Dummy Route Data:

The project uses dummy-route.json for the default "Today" route.

For "Yesterday" and "Day before Yesterday" functionality, you will need to create additional JSON files in the same directory:

yesterday-route.json

day-before-yesterday-route.json

These files should have the same JSON structure as dummy-route.json (an array of objects with latitude, longitude, and timestamp).

Open in Browser:

Simply open the index.html file in your web browser. No local server is strictly required for basic functionality.

**If the above method does not work follow these steps:
  -save the repo locally 
  -run turminal in same folder where the repo files are saved 
  -run this command 'python3 -m http.server 8000' 
  -then open this on browser http://localhost:8000/


File Structure
.
├── index.html          # Main HTML structure of the application
├── style.css           # CSS for styling the map and controls
├── script.js           # JavaScript logic for map interaction, simulation, and controls
├── dummy-route.json    # Default (Today's) vehicle route data
├── yesterday-route.json (Optional) # Route data for yesterday
└── images/
    └── car-icon.png # Vehicle icon image
└── README.md           # This file

External Libraries Used (CDNs)
Leaflet.js: Core mapping library.

leaflet.css

leaflet.js

Leaflet.Marker.SlideTo: For smooth marker animation.

leaflet.smooth_slideto.js

Leaflet.RotatedMarker: For rotating the marker icon.

leaflet.rotatedMarker.min.js

Leaflet.PolylineDecorator: For adding directional arrows to polylines.

leaflet.polylineDecorator.min.js

Google Fonts (Roboto): For enhanced typography.

Roboto font
