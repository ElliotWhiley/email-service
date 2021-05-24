import { useState } from "react";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import "./App.css";

function App() {
	const creds = {
		accessKeyId: "",
		secretAccessKey: "",
	};

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

	const [emailDeliveryReports, setEmailDeliveryReports] = useState<any[]>([]);

	async function getEmailDeliveryReports(event: any) {
		event.preventDefault();

		try {
			const params = {
				TableName: "EmailDeliveryReport",
				ExpressionAttributeValues: {
					":messageStatusValue": { N: "1" },
					":now": { S: new Date().toISOString() },
				},
				KeyConditionExpression:
					"MessageStatus = :messageStatusValue AND CreatedOn < :now",
			};
			const command = new QueryCommand(params);
			console.log(command);
			const client = new DynamoDBClient({
				region: "us-west-2",
				credentials: creds,
			});
			console.log(client);

			const data = await client.send(command);
			console.log(data);
			const items: any = data.Items;
			setEmailDeliveryReports(items);
		} catch (error) {
			console.log(error);
		} finally {
		}
	}

	return (
		<>
			<div className="App">
				<form onSubmit={sendEmail}>
					<select
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						name="users"
						required
					>
						<option value="elliot.whiley94@gmail.com">
							Elliot
						</option>
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
					<button>Send email</button>
				</form>
			</div>
			<div>
				<button onClick={getEmailDeliveryReports}>Email stats</button>
				{emailDeliveryReports &&
					emailDeliveryReports.map((report) => (
						<ul key={report.CreatedOn.S}>
							<li>{report.MessageStatus.N}</li>
							<li>{report.CreatedOn.S}</li>
							<li>{report.EmailAddress.S}</li>
							<li>{report.MessageId.S}</li>
						</ul>
					))}
			</div>
		</>
	);
}

export default App;
