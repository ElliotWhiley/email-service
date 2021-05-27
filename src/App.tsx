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
			const client = new SQSClient({
				region: "us-west-2",
				credentials: creds,
			});

			await client.send(command);
		} catch (error) {
			console.log(error);
		} finally {
		}
	}

	const [emailsSent, setEmailsSent] = useState(0);
	const [emailsDelivered, setEmailsDelivered] = useState(0);
	const [emailsOpened, setEmailsOpened] = useState(0);

	async function getEmailDeliveryReports(event: any) {
		event.preventDefault();

		const sent: number = await getEmailDeliveryReportsOfStatus(1);
		var delivered: number = await getEmailDeliveryReportsOfStatus(2);
		var opened: number = await getEmailDeliveryReportsOfStatus(3);
		setEmailsSent(sent);
		setEmailsDelivered(delivered);
		setEmailsOpened(opened);
	}

	async function getEmailDeliveryReportsOfStatus(emailStatus: number) {
		try {
			const params = {
				TableName: "EmailDeliveryReport",
				ExpressionAttributeValues: {
					":emailStatusValue": { N: emailStatus.toString() },
					":now": { S: new Date().toISOString() },
				},
				KeyConditionExpression:
					"EmailStatus = :emailStatusValue AND CreatedOn < :now",
			};
			const command = new QueryCommand(params);
			const client = new DynamoDBClient({
				region: "us-west-2",
				credentials: creds,
			});

			const data = await client.send(command);
			// console.log("******", data);
			const items: any = data.Items;
			return items.length;
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<div className="App center">
			<form className="border-bottom" onSubmit={sendEmail}>
				<select
					className="pad-right"
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
					className="pad-right"
					value={template}
					onChange={(event) => setTemplate(event.target.value)}
					name="users"
					required
				>
					<option value="Pokemon">Pokemon</option>
					<option value="Greeting">Greeting</option>
				</select>
				<input
					className="pad-right"
					type="text"
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder="Name"
					required
				/>
				<button>Send email</button>
			</form>
			<br></br>
			<button onClick={getEmailDeliveryReports}>Email stats</button>
			<div>Total emails sent: {emailsSent}</div>
			<div>Total emails delivered: {emailsDelivered}</div>
			<div>Total emails opened: {emailsOpened}</div>
			<div>
				Open rate:{" "}
				<b>
					{emailsOpened === 0 || emailsDelivered === 0
						? "?"
						: ((emailsOpened / emailsDelivered) * 100).toFixed(1)}
					%
				</b>
			</div>
		</div>
	);
}

export default App;
