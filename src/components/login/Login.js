import React, { useEffect, useRef, useContext } from "react";
import validator from "validator";
import { useHistory } from "react-router-dom";
import Button from '@mui/material/Button';
import withModal from "../common/Modal";
import SignUp from "../register/SignUp";

import Context from "../../context";

import * as firebaseService from "../../services/firebase";
import * as uiService from "../../services/ui";

import './Login.css';

const Login = ({ toggleModal }) => {
	const { setUser } = useContext(Context);

	const emailRef = useRef(null);
	const passwordRef = useRef(null);

	const history = useHistory();

	useEffect(() => {
		const authedUser = JSON.parse(localStorage.getItem("auth"));
		if (authedUser) {
			history.push("/");
		} else {
			setUser(null);
		}
	}, [history, setUser]);

	const login = async () => {
		try {
			uiService.showLoading();
			const { email, password } = getInputs();
			if (isUserCredentialsValid(email, password)) {
				await firebaseService.login(email, password);
				const user = await firebaseService.getSingleDataWithQuery({
					key: "users",
					query: "email",
					criteria: email,
				});
				saveAuthedInfo(user);
				uiService.hideLoading();
				console.log("redirecting to /");
				history.push("/");
			} else {
				uiService.hideLoading();
				uiService.alert(`Your user's name or password is not correct`);
			}
		} catch (error) {
			uiService.hideLoading();
		}
	};

	const getInputs = () => {
		const email = emailRef.current.value;
		const password = passwordRef.current.value;
		return { email, password };
	};

	const isUserCredentialsValid = (email, password) => {
		return validator.isEmail(email) && password;
	};

	const saveAuthedInfo = (user) => {
		setUser(user);
		localStorage.setItem("auth", JSON.stringify(user));
	};

  return (
    <div className="login__container">
      <div className="login__form-container center">
        <div className="login__form">
            <div className="heading">
              <h2 className="login__title">Login/Sign Up</h2>
            </div>
          <input
            type="text"
            placeholder="Email or phone number"
            ref={emailRef}
          />
          <input type="password" placeholder="Password" ref={passwordRef} />
          <div>
          <Button  variant="outlined" className="login__submit-btn" onClick={login}>
            Login
          </Button>
          <Button variant="outlined" color="secondary" className="login__submit-btn" onClick={() => toggleModal(true)}>
            Create New Account
          </Button>
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default withModal(SignUp)(Login);
