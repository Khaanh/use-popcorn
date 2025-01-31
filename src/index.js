import React from "react";
import ReactDOM from "react-dom/client";
import StarRating from "./StarRating";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		{/* <StarRating
			maxRating={5}
			messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
		/>
		<StarRating
			maxRating={15}
			size={24}
			color="red"
			className="test"
			defaultRating={3}
		/> */}
		<App />
	</React.StrictMode>
);
