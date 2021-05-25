var aws = require("aws-sdk");
var ses = new aws.SES({ region: "us-west-2" });
var dynamodb = new aws.DynamoDB({ region: "us-west-2" });

exports.handler = async (event) => {
	console.log("Processing event:", event);
	const message = JSON.parse(event.Records[0].body);
	console.log("Message:", message);
	console.log("Recipient:", message.recipient);
	console.log("Template:", message.template);
	console.log("Name:", message.name);

	var params = {
		Destination: {
			ToAddresses: [message.recipient],
		},
		ConfigurationSetName: "EmailEventSet",
		Template: message.template,
		TemplateData: `{ "name":"${message.name}" }`,
		Source: "",
	};

	const response = await ses.sendTemplatedEmail(params).promise();
	const now = new Date().toISOString();
	const randomUserId = Math.floor(Math.random() * 9999999999).toString();

	const dynamoParams = {
		Item: {
			MessageId: {
				S: response.MessageId,
			},
			CreatedOn: {
				S: now,
			},
			UserId: {
				S: randomUserId,
			},
			EmailAddress: {
				S: message.recipient,
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
