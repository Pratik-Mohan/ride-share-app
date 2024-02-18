import { useContext } from "react";
import { realTimeDb } from "../../firebase";
import { v4 as uuidv4 } from "uuid";
import * as uiService from "../../services/ui";
import Context from "../../context";
import Button from '@mui/material/Button';

function RequestRide(props) {
	const { toggleModal } = props;

	const { user, selectedFrom, selectedTo, setRideRequest } =
		useContext(Context);

	// req ride
	const requestRide = () => {
		if (user && selectedFrom && selectedTo) {
			toggleModal(false);
			uiService.showLoading();
			// create object of ride type
			const rideUuid = uuidv4();
			const ride = {
				rideUuid: rideUuid,
				requestor: user,
				pickup: selectedFrom,
				destination: selectedTo,
				status: 0,
			};
			// insert ride obj to Firebase realtime database.
			realTimeDb
				.ref(`rides/${rideUuid}`)
				.set(ride)
				.then(() => {
					setRideRequest(ride);
					uiService.showLoading();
				})
				.catch(() => {
					uiService.hideLoading();
				});
		}
	};

	return (
		<div className="request-ride">
			<div className="request-ride__content">
				<div className="request-ride__container">
					<div className="request-ride__title">Requesting a Ride</div>
					<div className="request-ride__close">
						<img
							alt="close"
							onClick={() => toggleModal(false)}
							src="https://cdn.iconscout.com/icon/free/png-512/free-cross-274-458475.png?f=webp&w=32"
						/>
					</div>
				</div>
				<div className="request-ride__subtitle"></div>
				<div className="request-ride__form">
					<p>
						You entered the pickup location successfully. Do you want to request
						a ride now ?
					</p>
					<Button
						variant="outlined"
						className="request-ride__btn request-ride__change-btn"
						onClick={() => toggleModal(false)}
					>
						Change
					</Button>
					<Button variant="outlined" className="request-ride__btn" onClick={requestRide}>
						Requesting a ride now
					</Button>
				</div>
			</div>
		</div>
	);
}

export default RequestRide;
