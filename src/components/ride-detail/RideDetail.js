import { useContext } from "react";
import * as uiService from "../../services/ui";
import { v4 as uuidv4 } from "uuid";
import { realTimeDb } from "../../firebase";
import Context from "../../context";
import Button from '@mui/material/Button';

function RideDetail(props) {
	const { user, isDriver, currentRide, requestor, driver } = props;

	const { setCurrentRide } = useContext(Context);
	const whatsAppLinks = `https://api.whatsapp.com/send?phone=91${driver.phone}&text=Hey ${user.fullname}! ${driver.fullname} has accepted your ride`;
	// removing ride from mem
	const removeRideFromStorageAndContext = () => {
		localStorage.removeItem("currentRide");
		setCurrentRide(null);
		// f5 go brrr
		window.location.reload();
	};

	const updateRide = (ride) => {
		uiService.showLoading(); // update data on Firebase.
		realTimeDb
			.ref(`rides/${ride.rideUuid}`)
			.set(ride)
			.then(() => {
				uiService.hideLoading();
				removeRideFromStorageAndContext();
			})
			.catch(() => {
				uiService.hideLoading();
			});
	};

	// method to cancel ride
	const cancelRide = () => {
		const isCancel = window.confirm("Do you want to cancel this ride?");
		if (isCancel) {
			// update data on Firebase.
			currentRide.status = -1;
			updateRide(currentRide);
		}
	};

	// ride over
	const finishRide = () => {
		const isFinish = window.confirm("Do you want to finish this ride?");
		if (isFinish) {
			// update data on Firebase.
			currentRide.status = 2;
			updateRide(currentRide);
		}
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		const feedback = event.target.feedback.value;
		const driverName = driver.fullname;
		const userName = requestor.fullname;
		const rideId = currentRide.rideUuid;
		const id = uuidv4();
		const feedbacks = {
			feedbackId: id,
			driver: driverName,
			feedback: feedback,
			user: userName,
			rideId: rideId
		};
		uiService.showLoading(); // update data on Firebase.
		realTimeDb
			.ref(`feedbacks/${id}`)
			.set(feedbacks)
			.then(() => {
				uiService.hideLoading();
			})
			.catch(() => {
				uiService.hideLoading();
			});
	};

	return (
		<div className="ride-detail">
			<div className="ride-detail__user-avatar">
				{console.log(currentRide)}
				{console.log(user)}
				<img src={user.image} alt={user.email} />
			</div>
			<p className="ride-detail__user-info">
				{user.email} - {user.phone}
			</p>
			<div className="ride-detail__actions">
				<p className="ride-detail__result-label">
					<span>From: </span>
					{currentRide.pickup && currentRide.pickup.label
						? currentRide.pickup.label
						: ""}
				</p>
				<p className="ride-detail__result-label">
					<span>To: </span>
					{currentRide.destination && currentRide.destination.label
						? currentRide.destination.label
						: ""}
				</p>
				{!isDriver && (
					<form onSubmit={handleSubmit} required>
						<input
							type="text"
							id="feedback"
							name="feedback"
							placeholder="Enter feedback here"
						/>
						<Button variant="outlined" className="ride-detail__btn" type="submit">
							Submit Feedback
						</Button>
					</form>
				)}
				{isDriver && (
					<a
						href={whatsAppLinks}
						className="ride-detail__btn"
						target="_blank"
						rel="noreferrer"
					>
						{"Send WhatsApp Message"}
					</a>
				)}
				<Button variant="outlined" className="ride-detail__btn" onClick={cancelRide}>
					Cancel the Ride
				</Button>
				{isDriver && (
					<Button variant="outlined" className="ride-detail__btn" onClick={finishRide}>
						Finish the Ride
					</Button >
				)}
			</div>
		</div>
	);
}

export default RideDetail;
