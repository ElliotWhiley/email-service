var aws = require("aws-sdk");
var dynamodb = new aws.DynamoDB({ region: "us-west-2" });

exports.handler = async (event) => {
	console.log("Event:", event);
	const message = JSON.parse(event.Records[0].Sns.Message);
	console.log("Message:", message);
	console.log("EventType:", message.eventType);

	var messageStatus;
	switch (message.eventType) {
		case "Send":
			messageStatus = 1;
			break;

		case "Delivery":
			messageStatus = 2;
			break;

		case "Open":
			messageStatus = 3;
			break;

		case "Click":
			messageStatus = 4;
			break;

		default:
			return;
	}

	const now = new Date().toISOString();

	var dynamoParams = {
		Item: {
			MessageStatus: {
				N: messageStatus.toString(),
			},
			CreatedOn: {
				S: now,
			},
			MessageId: {
				S: message.mail.messageId,
			},
			EmailAddress: {
				S: message.mail.destination[0],
			},
		},
		TableName: "",
	};

	const dynamoResponse = await dynamodb
		.putItem(dynamoParams, function (err, data) {
			if (err) console.log(err, err.stack);
			// an error occurred
			else console.log(data); // successful response
		})
		.promise();
};
