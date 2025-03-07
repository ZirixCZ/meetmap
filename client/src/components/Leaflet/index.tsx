import { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, Marker, TileLayer, Popup, useMap, useMapEvents } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import { useLeafletContext } from "./context/LeafletContext";
import MapView from "./MapView";
import SidebarInfo from "./components/SidebarInfo";
import { Marker as MarkerType } from "../../types";
import userArrow from "../../assets/map-pin.png";
import mapPin from "../../assets/pin.png"; // Arrow marker for user direction
import MeetupData from "../../types/meetupData";
import CustomButton from "../ui/AuthDialog/CustomButton";
import Meetup from "../Meetup/Meetup";


// User Location Icon (uses an arrow to show direction)
const userLocationIcon = new L.DivIcon({
  html: `<img src="${userArrow}" style="width:32px; height:32px; transform: rotate(0deg);" id="user-marker">`,
  iconSize: [32, 32],
  className: "user-location-icon",
});

// Meetup Marker Icon
const meetupIcon = new L.Icon({
  iconUrl: mapPin,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Handles right-clicks to create meetups
const RightClickHandler = ({ onRightClick }: { onRightClick: (latlng: L.LatLng) => void }) => {
  useMapEvents({
    contextmenu: (event) => {
      onRightClick(event.latlng);
    },
  });
  return null;
};

// Handles live user tracking
const LiveLocation = ({ position, heading }: { position: [number, number]; heading: number }) => {
  const map = useMap();
  const isFirstRender = useRef(true); // Track first render

  useEffect(() => {
    if (isFirstRender.current) {
      map.setView(position, map.getZoom(), { animate: true });
      isFirstRender.current = false; // Mark as initialized
    }

    // Rotate user marker based on heading
    const markerElement = document.getElementById("user-marker");
    if (markerElement) {
      markerElement.style.transform = `rotate(${heading}deg)`;
    }
  }, [position, heading, map]);

  return <Marker position={position} icon={userLocationIcon} />;
};


const Leaflet = () => {
  const { markers, updateMarkersDebounce } = useLeafletContext();
  const [activeMarker, setActiveMarker] = useState<MarkerType | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [meetups, setMeetups] = useState<{ id: number; position: [number, number] }[]>([]);
  const rightClickPos = useRef<LatLngExpression | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LatLngExpression | null>(null);

  const [showMeetupDialog, setShowMeetupDialog] = useState(false);

  const dialogOnSubmit = (data: MeetupData) => {
    //TODO: create meetup
    console.log(data);
    setShowMeetupDialog(false);
    setShowPopup(false);
  }
  const meetupDialogOnClose = () => {
    rightClickPos.current = null;
    setShowMeetupDialog(false);
    setShowPopup(false);
    setSelectedLocation(null);
    
  }

  const meetupDialog = useMemo(() => {
    if (!showMeetupDialog) return null;
    return <Meetup onSubmit={dialogOnSubmit} closeCallback={meetupDialogOnClose} location={rightClickPos.current} />;
  }, [showMeetupDialog]);

  

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting live location:", error);
        },
        { enableHighAccuracy: true, maximumAge: 0 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setHeading(event.alpha); // `alpha` gives compass heading (0° = North)
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  const handleRightClick = (latlng: L.LatLng) => {
   
    rightClickPos.current = [latlng.lat, latlng.lng];
    setShowPopup(true);
  };

  

  const createMeetup = () => {
    if (rightClickPos) {

      setShowMeetupDialog(true);
      setShowPopup(false);
      setSelectedLocation(rightClickPos.current);

      //setMeetups((prev) => [...prev, { id: Date.now(), position: rightClickPos }]);
      //setRightClickPos(null); // Hide popup after creating meetup
      
    }
  };

  const handleClick = (marker: MarkerType) => {
    setActiveMarker(marker);
  };

  const closeCallback = () => {
    setActiveMarker(null);
  };

  return (
    <MapContainer
      center={userLocation || [50.209722, 15.830473]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {userLocation && <LiveLocation position={userLocation} heading={heading} />}

      <RightClickHandler onRightClick={handleRightClick} />

      {showPopup && rightClickPos.current && (
        <Popup position={rightClickPos.current} eventHandlers={{ remove: () => rightClickPos.current = null }}>
          <div>
            <p>Vytvořit meetup na tomto místě?</p>
            <CustomButton onClick={createMeetup} text="Vytvořit meetup"></CustomButton>
          </div>
        </Popup>
      )}

      {meetupDialog}
      {selectedLocation && <Marker position={selectedLocation} icon={meetupIcon} />}

      {meetups.map((meetup) => (
        <Marker key={meetup.id} position={meetup.position} icon={meetupIcon}>
          <Popup>Meetup Location</Popup>
        </Marker>
      ))}

      {activeMarker && <SidebarInfo closeCallback={closeCallback} marker={activeMarker} />}
      <MapView handleClick={handleClick} markers={markers} updateMarkers={updateMarkersDebounce} />
    </MapContainer>
  );
};

export default Leaflet;
