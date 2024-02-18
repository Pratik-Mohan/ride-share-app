import { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect,
} from "react-router-dom";
import Home from "./components/home/Home";
import Login from "./components/login/Login";
import Loading from "./components/common/Loading";
import Admin from "./components/admin/Admin";
import PrivateRoute from "./components/common/PrivateRoute";
import "./index.css";
import * as uiService from "./services/ui";
import Context from "./context";
import { realTimeDb } from "./firebase";
function App() {
	const [user, setUser] = useState(null);
	const [selectedFrom, setSelectedFrom] = useState(null);
	const [selectedTo, setSelectedTo] = useState(null);
	const [rideRequest, setRideRequest] = useState(null);
	const [currentRide, setCurrentRide] = useState(null);

	const lookingDriverMaxTime = 5 * 60 * 1000;

	useEffect(() => {
		initAuthUser();
		initCurrentRide();
	}, []);

	useEffect(() => {
		if (rideRequest) {

			const lookingDriverTimeout = setTimeout(() => {
				alert(
					"Cannot find your driver, please re-enter your pickup location and try again"
				);
				
				setRideRequest(null);
				
				uiService.hideLoading();
			}, lookingDriverMaxTime);
			
			uiService.showLoading();
			
			const createdRideRef = realTimeDb.ref(`rides/${rideRequest.rideUuid}`);
			createdRideRef.on("value", (snapshot) => {
				const updatedRide = snapshot.val();
				console.log(updatedRide);
				
				if (
					updatedRide &&
					updatedRide.rideUuid === rideRequest.rideUuid &&
					updatedRide.status === 1
				) {
					
					uiService.hideLoading();
					
					clearTimeout(lookingDriverTimeout);
					
					setRideRequest(null);
					
					localStorage.setItem("currentRide", JSON.stringify(updatedRide));
					
					setCurrentRide(() => updatedRide);
				}
			});
		}
	}, [rideRequest, lookingDriverMaxTime]);

	useEffect(() => {
		if (currentRide) {
			const currentRideRef = realTimeDb.ref(`rides/${currentRide.rideUuid}`);
			currentRideRef.on("value", (snapshot) => {
				const updatedRide = snapshot.val();
				console.log("updated ride in cancel or finished blob");
				console.log(updatedRide);
				console.log("current ride in cancel or finished blob");
				console.log(currentRide);

				if (
					updatedRide &&
					updatedRide.rideUuid === currentRide.rideUuid &&
					(updatedRide.status === -1 || updatedRide.status === 2)
				) {
					localStorage.removeItem("currentRide");
					setCurrentRide(null);
					window.location.reload();
					if (updatedRide.status === -1) {
						uiService.alert("Ride Aborted!");
					}
					if (updatedRide.status === 2) {
						uiService.alert("Ride Completed!");
					}
				}
			});
		}
	}, [currentRide]);
	const initCurrentRide = () => {
		const currentRide = localStorage.getItem("currentRide");
		if (currentRide) {
			setCurrentRide(() => JSON.parse(currentRide));
		}
	};

	// initiating auth of user
	const initAuthUser = () => {
		const authenticatedUser = localStorage.getItem("auth");
		console.log(authenticatedUser);
		if (authenticatedUser) {
			setUser(JSON.parse(authenticatedUser));
		}
	};
	const context = {
		user,
		setUser,
		selectedFrom,
		setSelectedFrom,
		selectedTo,
		setSelectedTo,
		rideRequest,
		setRideRequest,
		currentRide,
		setCurrentRide,
	};

	return (
		<Context.Provider value={context}>
			<Router>
				<Switch>
					<PrivateRoute exact path="/" component={Home} />
					<Route exact path="/login">
						<Login />
					</Route>
					<Route exact path="/admin">
						<Admin />
					</Route>
					<Route exact path="*">
						<Redirect to="/" />
					</Route>
				</Switch>
			</Router>
			<Loading />
		</Context.Provider>
	);
}

export default App;
