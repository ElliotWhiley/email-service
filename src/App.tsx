import "./App.css";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

async function sendEmail() {
	try {
		const message = {
			recipient: "elliot.whiley94@gmail.com",
			template: "Pokemon",
			name: "Elliot",
		};
		const params = {
			MessageBody: JSON.stringify(message),
			QueueUrl: "",
			MessageDeduplicationId: Math.floor(Math.random() * 100).toString(),
			MessageGroupId: Math.floor(Math.random() * 100).toString(),
		};
		const command = new SendMessageCommand(params);
		console.log(command);
		const creds = {
			accessKeyId: "",
			secretAccessKey: "",
		};
		const client = new SQSClient({
			region: "us-west-2",
			credentials: creds,
		});
		console.log(client);

		const data = await client.send(command);
		console.log(data);
	} catch (error) {
		console.log(error);
	} finally {
	}
}

function App() {
	return (
		<div className="App">
			<button onClick={sendEmail}>Send Email</button>
		</div>
	);
}

export default App;
