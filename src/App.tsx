import { useState } from "react";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import "./App.css";

function App() {
	const [email, setEmail] = useState("elliot.whiley94@gmail.com");
	const [template, setTemplate] = useState("Pokemon");
	const [name, setName] = useState("Elliot");

	async function sendEmail(event: any) {
		event.preventDefault();

		try {
			const message = {
				recipient: email,
				template: template,
				name: name,
			};
			const params = {
				MessageBody: JSON.stringify(message),
				QueueUrl: "",
				MessageDeduplicationId: Math.floor(
					Math.random() * 100
				).toString(),
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

	return (
		<div className="App">
			<form onSubmit={sendEmail}>
				<select
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					name="users"
					required
				>
					<option value="elliot.whiley94@gmail.com">Elliot</option>
					<option value="kirsten.whittington1993@gmail.com">
						Kirsten
					</option>
				</select>
				<select
					value={template}
					onChange={(event) => setTemplate(event.target.value)}
					name="users"
					required
				>
					<option value="Pokemon">Pokemon</option>
					<option value="Greeting">Greeting</option>
				</select>
				<input
					type="text"
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder="Name"
					required
				/>
				<button>Send email!</button>
			</form>
		</div>
	);
}

export default App;
