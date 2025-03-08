import { useState, useEffect, useRef, useMemo } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import { useLeafletContext } from "./context/LeafletContext";
import MapView from "./MapView";
import SidebarInfo from "./components/SidebarInfo";
import { Marker as MarkerType } from "../../types";
import userArrow from "../../assets/map-pin.png";
import mapPin from "../../assets/pin.png";
import newMeetupPNG from "../../assets/meetup.png";
import MeetupData from "../../types/meetupData";
import CustomButton from "../ui/AuthDialog/CustomButton";
import Meetup from "../Meetup/Meetup";
import { apiUrl } from "../../Constants/constants";
import { useUser } from "../../contexts/UserContext";
import { useGetMeetups } from "../../hooks/useGetMeetups";

// User Location Icon (uses an arrow to show direction)
const userLocationIcon = new L.DivIcon({
  html: `
    <div style="
      width: 16px;
      height: 16px;
      background-color: rgba(109, 101, 252, 1);
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 8px rgba(109, 101, 252, 1);
    "></div>
  `,
  className: "", // Prevents Leaflet from applying default styles
  iconSize: [16, 16],
  iconAnchor: [8, 8], // Centers the dot properly
});

// Meetup Marker Icon
const meetupIcon = new L.Icon({
  iconUrl: mapPin,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const newMeetupIcon = new L.Icon({
  iconUrl: newMeetupPNG,
  iconSize: [96, 96],
  iconAnchor: [48, 48],
});

// Handles right-clicks to create meetups
const RightClickHandler = ({
  onRightClick,
}: {
  onRightClick: (latlng: L.LatLng) => void;
}) => {
  useMapEvents({
    contextmenu: (event) => {
      onRightClick(event.latlng);
    },
  });
  return null;
};

// Handles live user tracking
const LiveLocation = ({
  position,
  heading,
}: {
  position: [number, number];
  heading: number;
}) => {
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

  return (
    <Marker position={position} icon={userLocationIcon} zIndexOffset={1000} />
  );
};

const Leaflet = () => {
  const user = useUser();
  const { markers, updateMarkersDebounce } = useLeafletContext();
  const [activeMarker, setActiveMarker] = useState<MarkerType | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [heading, setHeading] = useState<number>(0);
  const rightClickPos = useRef<LatLngExpression | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LatLngExpression | null>(null);

  const meetups = useGetMeetups();

  const [showMeetupDialog, setShowMeetupDialog] = useState(false);

  const dialogOnSubmit = async (data: MeetupData) => {
    const response = await fetch(apiUrl + "/create-meetup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: user.token || "",
      },
      body: JSON.stringify({
        name: data.meetupName,
        date: data.date,
        begin_time: data.fromTime + ":00",
        end_time: data.toTime + ":00",
        lat: data.location[0],
        lon: data.location[1],
        public: data.isPublic,
        min_age: data.minimumAge,
        max_age: data.maximumAge,
        require_verification: !data.allowUnverifiedUsers,
        users: data.invited,
        description: data.meetupDesc,
      }),
    });

    if (!response.ok) {
      console.error("Failed to create meetup", response.statusText);
      return;
    }

    console.log(data);
    setShowMeetupDialog(false);
    setShowPopup(false);
  };
  const meetupDialogOnClose = () => {
    rightClickPos.current = null;
    setShowMeetupDialog(false);
    setShowPopup(false);
    setSelectedLocation(null);
  };

  const meetupDialog = useMemo(() => {
    if (!showMeetupDialog) return null;
    return (
      <Meetup
        onSubmit={dialogOnSubmit}
        closeCallback={meetupDialogOnClose}
        location={rightClickPos.current}
      />
    );
  }, [showMeetupDialog]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (error) => {
          console.error("Error getting live location:", error);
        },
        { enableHighAccuracy: true, maximumAge: 0 },
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    const meetups = fetch(apiUrl + "/get-meetups", {
      headers: {
        Authorization: user.token || "",
      },
    });
  }, []);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setHeading(event.alpha); // `alpha` gives compass heading (0° = North)
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () =>
      window.removeEventListener("deviceorientation", handleOrientation);
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

  const createMeetupCallback = (marker: MarkerType) => {
    console.log("marker callback", marker);
    rightClickPos.current = [marker.lat ?? 0, marker.lng ?? 0];
    setActiveMarker(null);
    createMeetup();
  };

  return (
    <>
      {activeMarker && (
        <SidebarInfo
          createMeetupCallback={createMeetupCallback}
          closeCallback={closeCallback}
          marker={activeMarker}
        />
      )}
      <MapContainer
        center={userLocation || [50.209722, 15.830473]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {userLocation && (
          <LiveLocation position={userLocation} heading={heading} />
        )}

        <RightClickHandler onRightClick={handleRightClick} />

        {showPopup && rightClickPos.current && (
          <Popup
            position={rightClickPos.current}
            eventHandlers={{
              remove: () => {
                rightClickPos.current = null;
                setShowPopup(false);
              },
            }}
          >
            <div>
              <p>Vytvořit meetup na tomto místě?</p>
              <CustomButton
                onClick={createMeetup}
                text="Vytvořit meetup"
              ></CustomButton>
            </div>
          </Popup>
        )}

        {meetupDialog}
        {selectedLocation && (
          <Marker position={selectedLocation} icon={meetupIcon} />
        )}

        {meetups.meetups?.length &&
          meetups.meetups.map((meetup) => (
            <Marker
              zIndexOffset={999}
              key={meetup.id}
              position={meetup?.point}
              icon={newMeetupIcon}
            >
              <Popup>Meetup Location</Popup>
            </Marker>
          ))}

        <MapView
          handleClick={handleClick}
          markers={markers}
          updateMarkers={updateMarkersDebounce}
        />
      </MapContainer>
    </>
  );
};

export default Leaflet;
