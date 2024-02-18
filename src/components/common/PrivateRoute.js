import React from "react";
import { Route, Redirect } from "react-router-dom";

const PrivateRoute = ({ component: Component, ...rest }) => {
  console.log(JSON.stringify(localStorage.getItem("auth")))
  return (
		<Route
			{...rest}
			render={(props) =>
				localStorage.getItem("auth") ? (
					JSON.parse(localStorage.getItem("auth")) && 
          JSON.parse(localStorage.getItem("auth")).role ==="admin"? (
						<Redirect to = "/admin" />
					) : (
						<Component {...props}/>
					)
				) : (
					<Redirect to="/login" />
				)
			}
		/>
	);
};

export default PrivateRoute;
