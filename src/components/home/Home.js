import React, { useEffect, useRef, useContext, useCallback, useHistory } from "react";
import L from "leaflet";

import AddressPicker from "../address-picker/AddressPicker";
import Header from "../common/Header";
import RideDetail from "../ride-detail/RideDetail";
import RideList from "../ride-list/RideList";

import Context from "../../context";

require("leaflet-routing-machine");


const Home = () => {
  const map = useRef();
  const routeControl = useRef();

  const { selectedFrom, selectedTo, user, currentRide } = useContext(Context);


  const style = {
    width: "100%",
    height: "100vh",
  };

  useEffect(() => {
    initMap();
    initRouteControl();
  }, []);

  const drawRoute = useCallback((from, to) => {
    if (shouldDrawRoute(from, to) && routeControl && routeControl.current) {
      const fromLatLng = new L.LatLng(from.y, from.x);
      const toLatLng = new L.LatLng(to.y, to.x);
      routeControl.current.setWaypoints([fromLatLng, toLatLng]);
    }
  }, []);

  useEffect(() => {
    if (shouldDrawRoute(selectedFrom, selectedTo)) {
      drawRoute(selectedFrom, selectedTo);
    }
  }, [selectedFrom, selectedTo, drawRoute]);

  const shouldDrawRoute = (selectedFrom, selectedTo) => {
    return (
      selectedFrom?.label &&
      selectedTo?.label &&
      selectedFrom?.x &&
      selectedTo?.x &&
      selectedFrom?.y &&
      selectedTo?.y
    );
  };


  const initMap = async () => { 
    map.current = L.map("map", {
			center: [28.359366651427703, 75.58814234242922],
			zoom: 13,
			layers: [
				L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
					attribution:
						'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				}),
			],
		});
  };

  const initRouteControl = () => {
    routeControl.current = L.Routing.control({
      show: true,
      fitSelectedRoutes: true,
      plan: false,
      lineOptions: {
        styles: [
          {
            color: "red",
            opacity: "0.7",
            weight: 6,
          },
        ],
      },
      router: L.Routing.mapbox(`${process.env.REACT_APP_MAP_BOX_API_KEY}`),
    })
      .addTo(map.current)
      .getPlan();
  };

  const renderSidebar = () => {
    if(user) console.log(user.role);
    else console.log("null user");
    console.log("current ride");
    console.log(currentRide);
    const isPassenger = user && user.role === "passenger";
    if (isPassenger && !currentRide) {
      return <AddressPicker />;
    }
    if (isPassenger && currentRide) {
      return (
				<RideDetail
					user={currentRide.driver}
					driver={currentRide.driver}
					requestor={currentRide.requestor}
					isDriver={false}
					currentRide={currentRide}
				/>
			);
    }
    if (!isPassenger && !currentRide) {
      return <RideList />;
    }
    if (!isPassenger && currentRide) {
      return (
        <RideDetail
          user={currentRide.requestor}
          requestor = {currentRide.requestor}
          driver = {currentRide.driver}
          isDriver={true}
          currentRide={currentRide}
        />
      );
    }
    return <></>;
  };

  return (
    <>
      <Header />
      <div id="map" style={style} />
      {renderSidebar()}
    </>
  );
};

export default Home;
