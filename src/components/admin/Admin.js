import React, { useEffect, useState, useContext } from "react";
import Header from "../common/Header";
import Context from "../../context";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";
import { realTimeDb } from "../../firebase";

const Admin = () => {
	const [users, setUsers] = useState([]);
	const [rides, setRides] = useState([]);
	const [feedbacks, setFeedbacks] = useState([]);

	useEffect(() => {
		const usersRef = realTimeDb.ref("users");
		const ridesRef = realTimeDb.ref("rides");
		const feedbacksRef = realTimeDb.ref("feedbacks");

		usersRef.on("value", (snapshot) => {
			const newUsers = [];
			snapshot.forEach((childSnapshot) => {
				newUsers.push({ id: childSnapshot.key, ...childSnapshot.val() });
			});
			setUsers(newUsers);
		});

		ridesRef.on("value", (snapshot) => {
			const newRides = [];
			snapshot.forEach((childSnapshot) => {
				newRides.push({ id: childSnapshot.key, ...childSnapshot.val() });
			});
			setRides(newRides);
		});

		feedbacksRef.on("value", (snapshot) => {
			const newFeedbacks = [];
			snapshot.forEach((childSnapshot) => {
				newFeedbacks.push({ id: childSnapshot.key, ...childSnapshot.val() });
			});
			setFeedbacks(newFeedbacks);
		});

		return () => {
			usersRef.off();
			ridesRef.off();
			feedbacksRef.off();
		};
	}, []);

	const { user } = useContext(Context);

	if (user && user.role !== "admin") {
		localStorage.removeItem("auth");
		return <Redirect to="/"></Redirect>;
	}
	const statusResponse = (status) => {
		switch (status.toString()) {
			case 0:
				return "Finding Traveller";
			case 1:
				return "Ride In-Progress";
			case 2:
				return "Ride Completed";
			default:
				return "Ride Aborted";
		}
	};
	console.log(users);
	console.log(rides);
	console.log(feedbacks);
	return (
		<div>
			{" "}
			<Header /> <h1>Admin Page</h1> <h2>Users</h2>{" "}
			<table>
				{" "}
				<thead>
					{" "}
					<tr>
						{" "}
						<th>ID</th> <th>Name</th> <th>Phone</th>{" "}
					</tr>{" "}
				</thead>{" "}
				<tbody>
					{" "}
					{users.map((user) => (
						<tr key={user.id}>
							{" "}
							<td>{user.id}</td> <td>{user.fullname}</td> <td>{user.phone}</td>{" "}
						</tr>
					))}{" "}
				</tbody>{" "}
			</table>{" "}
			<h2>Rides</h2>{" "}
			<table>
				{" "}
				<thead>
					{" "}
					<tr>
						{" "}
						<th>ID</th> <th>Driver</th> <th>Passenger</th>
						<th>Pick-Up</th>
						<th>Drop-Off</th>
						<th>Status</th>{" "}
					</tr>{" "}
				</thead>{" "}
				<tbody>
					{" "}
					{rides.map((ride) => (
						<tr key={ride.id}>
							{" "}
							<td>{ride.id}</td>{" "}
							<td>{ride.status === 0 ? "Not Found" : ride.driver.fullname}</td>{" "}
							<td>{ride.requestor.fullname}</td>
							<td>{ride.pickup.label}</td>
							<td>{ride.destination.label}</td>
							<td>{statusResponse(ride.status)}</td>{" "}
						</tr>
					))}{" "}
				</tbody>{" "}
			</table>{" "}
			<h2>Feedbacks</h2>{" "}
			<table>
				{" "}
				<thead>
					{" "}
					<tr>
						{" "}
						<th>ID</th> <th>Traveller</th> <th>Travel Companion</th>{" "}
						<th>Feedback</th>{" "}
					</tr>{" "}
				</thead>{" "}
				<tbody>
					{" "}
					{feedbacks.map((feedback) => (
						<tr key={feedback.id}>
							{" "}
							<td>{feedback.id}</td> <td>{feedback.user}</td>{" "}
							<td>{feedback.driver}</td>
							<td>{feedback.feedback}</td>
							<td>{feedback.feedback}</td>
							<td>{feedback.feedback}</td>{" "}
						</tr>
					))}{" "}
				</tbody>{" "}
			</table>{" "}
		</div>
	);
};
export default Admin;
