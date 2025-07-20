let map, marker, route = [], currentRouteIndex = 0, polyline;
let intervalId, isPlaying = false;
const slider = document.getElementById('slider');
const playButton = document.getElementById('play');
const pauseButton = document.getElementById('pause');
const infoDisplay = document.getElementById('info');
const mapLoadingMessage = document.getElementById('map-loading-message');

const historyButton = document.getElementById('history-button');
const historyDropdownContent = document.getElementById('history-dropdown-content');
const historyDropdown = document.getElementById('history-controls');

const vehicleIcon = L.icon({
    iconUrl: 'images/car-icon.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

async function loadRouteForDay(day = 'today') {
  pauseSimulation();
  mapLoadingMessage.style.display = 'block';

  let filename = 'dummy-route.json';
  if (day === 'yesterday') {
    filename = 'yesterday-route.json';
  } else if (day === 'day-before-yesterday') {
    filename = 'day-before-yesterday-route.json';
  }

  try {
    const res = await fetch(filename);
    if (!res.ok) {
      if (filename !== 'dummy-route.json') {
          console.warn(`Route file '${filename}' not found, trying 'dummy-route.json'.`);
          const fallbackRes = await fetch('dummy-route.json');
          if (!fallbackRes.ok) throw new Error(`HTTP error! status: ${fallbackRes.status} for dummy-route.json`);
          route = await fallbackRes.json();
          infoDisplay.innerText = `Route for ${day} not found, showing default route.`;
      } else {
        throw new Error(`HTTP error! status: ${res.status} for ${filename}`);
      }
    } else {
        route = await res.json();
        infoDisplay.innerText = `Loaded route for ${day}.`;
    }

    mapLoadingMessage.style.display = 'none';

    if (route.length < 2) {
      console.warn("Route has less than 2 points, cannot simulate.");
      infoDisplay.innerText = `Error: Route data insufficient for ${day}.`;
      return;
    }

    const latlngs = route.map(p => [p.latitude, p.longitude]);
    slider.max = route.length - 1;
    slider.value = 0;

    if (map) {
      map.remove();
    }
    map = L.map('map').setView(latlngs[0], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    polyline = L.polyline([latlngs[0]], { color: 'blue', weight: 4 }).addTo(map);

    if (marker) {
      marker.remove();
    }
    marker = L.marker(latlngs[0], { icon: vehicleIcon, rotationAngle: 0 }).addTo(map);
    if (marker.slideTo) marker.slideTo(latlngs[0], { duration: 500 });

    currentRouteIndex = 0;
    updateInfo(route[0], route[0].timestamp, 0);
    updateControlsState();
  } catch (error) {
    console.error(`Failed to load route data for ${day}:`, error);
    mapLoadingMessage.style.display = 'none';
    infoDisplay.innerText = `Error loading route data for ${day}. Please check console for details.`;
    updateControlsState(true);
  }
}


function updateInfo(coord, timestamp, speed) {
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, timeZoneName: 'short'
  }).format(new Date(timestamp));

  infoDisplay.innerText =
    `Lat: ${coord.latitude.toFixed(6)}
Lng: ${coord.longitude.toFixed(6)}
Time: ${formattedTime}
Speed: ${speed !== null ? speed.toFixed(2) + ' km/h' : 'N/A'}`;
}

function startSimulation() {
  if (isPlaying || route.length < 2 || currentRouteIndex >= route.length - 1) return;
  isPlaying = true;
  updateControlsState();

  intervalId = setInterval(() => {
    if (currentRouteIndex >= route.length - 1) {
      clearInterval(intervalId);
      isPlaying = false;
      updateControlsState();
      return;
    }
    moveToIndex(currentRouteIndex + 1);
  }, 1000);
}

function calculateBearing(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => deg * Math.PI / 180;
    const toDeg = (rad) => rad * 180 / Math.PI;

    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
              Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
    let bearing = toDeg(Math.atan2(y, x));
    bearing = (bearing + 360) % 360;
    return bearing;
}

function moveToIndex(i) {
  if (i < 0 || i >= route.length) {
    return;
  }

  const prev = route[i - 1];
  const next = route[i];

  const latlng = [next.latitude, next.longitude];

  if (prev && next) {
      const bearing = calculateBearing(prev.latitude, prev.longitude, next.latitude, next.longitude);
      if (marker.setRotationAngle) {
          marker.setRotationAngle(bearing);
      }
  }

  if (marker.slideTo) {
    marker.slideTo(latlng, { duration: 1000 });
  } else {
    marker.setLatLng(latlng);
  }

  if (i > currentRouteIndex) {
      polyline.addLatLng(latlng);
  } else if (i < currentRouteIndex) {
      polyline.setLatLngs(route.slice(0, i + 1).map(p => [p.latitude, p.longitude]));
  }

  let speed = null;
  if (prev && next) {
    const t1 = new Date(prev.timestamp);
    const t2 = new Date(next.timestamp);
    const dtSeconds = (t2 - t1) / 1000;

    const distanceMeters = map.distance([prev.latitude, prev.longitude], latlng);

    if (dtSeconds > 0) {
      speed = (distanceMeters / 1000) / (dtSeconds / 3600);
    }
  }

  updateInfo(next, next.timestamp, speed);

  currentRouteIndex = i;
  slider.value = i;
}

function pauseSimulation() {
  clearInterval(intervalId);
  isPlaying = false;
  updateControlsState();
}

function updateControlsState(isDisabled = false) {
  playButton.disabled = isPlaying || isDisabled || currentRouteIndex >= route.length - 1;
  pauseButton.disabled = !isPlaying || isDisabled;
  slider.disabled = isDisabled;
}

slider.addEventListener('change', () => {
  pauseSimulation();
  const val = parseInt(slider.value);
  moveToIndex(val);
  map.setView(marker.getLatLng());
});

slider.addEventListener('input', () => {
    const val = parseInt(slider.value);
    const point = route[val];
    if (point) {
        marker.setLatLng([point.latitude, point.longitude]);
        polyline.setLatLngs(route.slice(0, val + 1).map(p => [p.latitude, p.longitude]));
        updateInfo(point, point.timestamp, null);

        if (val > 0) {
            const prevPoint = route[val - 1];
            const bearing = calculateBearing(prevPoint.latitude, prevPoint.longitude, point.latitude, point.longitude);
            if (marker.setRotationAngle) {
                marker.setRotationAngle(bearing);
            }
        }
    }
});

playButton.addEventListener('click', startSimulation);
pauseButton.addEventListener('click', pauseSimulation);

historyButton.addEventListener('click', function() {
  historyDropdown.classList.toggle('show');
});

historyDropdownContent.addEventListener('click', function(event) {
  event.preventDefault();
  if (event.target.tagName === 'A') {
    const day = event.target.dataset.day;
    historyDropdown.classList.remove('show');
    loadRouteForDay(day);
  }
});

window.addEventListener('click', function(event) {
  if (!event.target.matches('.dropbtn') && !event.target.closest('.dropdown-content')) {
    if (historyDropdown.classList.contains('show')) {
      historyDropdown.classList.remove('show');
    }
  }
});

loadRouteForDay('today');
updateControlsState(true);