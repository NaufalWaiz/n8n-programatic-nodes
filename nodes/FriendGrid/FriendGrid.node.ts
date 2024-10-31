import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IRequestOptions,
} from 'n8n-workflow';

export class FriendGrid implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FriendGrid',
        name: 'friendGrid',
        icon: 'file:friendGrid.svg',
        group: ['transform'],
        version: 1,
        description: 'Consume SendGrid API',
        defaults: {
            name: 'FriendGrid',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'friendGridApi',
                required: true,
            },
        ],
		properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true, // Add this line
                options: [
                    {
                        name: 'Contact',
                        value: 'contact',
                    },
                ],
                default: 'contact',

            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true, // Add this line
                options: [
                    {
                        name: 'Create',
                        value: 'create',
                    },
                ],
                default: 'create',

            },
            {
                displayName: 'Email',
                name: 'email',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        operation: [
                            'create',
                        ],
                        resource: [
                            'contact',
                        ],
                    },
                },
                default: '',
                placeholder: 'name@email.com',
                description: 'Primary email for the contact',
            },
            {
                displayName: 'Additional Fields',
                name: 'additionalFields',
                type: 'collection',
                placeholder: 'Add Field',
                default: {},
                displayOptions: {
                    show: {
                        resource: [
                            'contact',
                        ],
                        operation: [
                            'create',
                        ],
                    },
                },
                options: [
                    {
                        displayName: 'First Name',
                        name: 'firstName',
                        type: 'string',
                        default: '',
                    },
                    {
                        displayName: 'Last Name',
                        name: 'lastName',
                        type: 'string',
                        default: '',
                    },
                ],
            },
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData = [];
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;

        for (let i = 0; i < items.length; i++) {
            if (resource === 'contact' && operation === 'create') {
                const email = this.getNodeParameter('email', i) as string;
                const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
                const data: IDataObject = { email, ...additionalFields };

                const options: IRequestOptions = {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    method: 'PUT',
                    body: {
                        contacts: [data],
                    },
                    uri: 'https://api.sendgrid.com/v3/marketing/contacts',
                    json: true,
                };

                // Call SendGrid API with authentication
                const responseData = await this.helpers.requestWithAuthentication.call(this, 'friendGridApi', options);
                returnData.push(responseData);
            }
        }
        return [this.helpers.returnJsonArray(returnData)];
    }
}
