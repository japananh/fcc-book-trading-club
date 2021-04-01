/* eslint-disable no-console */
import runner from "./test-runner";

if (process.env.NODE_ENV === "test") {
	console.log("Running Tests...");
	setTimeout(() => {
		try {
			runner.run();
			console.log("Completed test");
		} catch (e) {
			console.log("Tests are not valid:", e);
		}
	}, 1500);
}
