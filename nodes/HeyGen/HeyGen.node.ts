import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeOperationError,
    NodeConnectionType,
} from 'n8n-workflow';
import { heyGenApiRequest } from './GenericFunctions';

export class HeyGen implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'HeyGen',
        name: 'heyGen',
        icon: 'file:heygen.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Consume HeyGen API',
        defaults: {
            name: 'HeyGen',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        credentials: [
            {
                name: 'heyGenApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Document',
                        value: 'document',
                    },
                ],
                default: 'document',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: [
                            'document',
                        ],
                    },
                },
                options: [
                    {
                        name: 'Upload',
                        value: 'upload',
                        description: 'Upload a document',
                        action: 'Upload a document',
                    },
                ],
                default: 'upload',
            },
            {
                displayName: 'Binary Data',
                name: 'binaryData',
                type: 'boolean',
                default: false,
                displayOptions: {
                    show: {
                        operation: [
                            'upload',
                        ],
                        resource: [
                            'document',
                        ],
                    },
                },
                description: 'If the data to upload should be taken from binary field',
            },
            {
                displayName: 'Binary Property',
                name: 'binaryPropertyName',
                type: 'string',
                default: 'data',
                required: true,
                displayOptions: {
                    show: {
                        operation: [
                            'upload',
                        ],
                        resource: [
                            'document',
                        ],
                        binaryData: [
                            true,
                        ],
                    },
                },
                description: 'Object property name which holds binary data',
            },
            {
                displayName: 'File URL',
                name: 'fileUrl',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        operation: [
                            'upload',
                        ],
                        resource: [
                            'document',
                        ],
                        binaryData: [
                            false,
                        ],
                    },
                },
                description: 'URL of the file to upload',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;

        let responseData;

        for (let i = 0; i < items.length; i++) {
            try {
                if (resource === 'document') {
                    if (operation === 'upload') {
                        const binaryData = this.getNodeParameter('binaryData', i) as boolean;

                        if (binaryData) {
                            const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

                            if (items[i].binary === undefined) {
                                throw new NodeOperationError(this.getNode(), 'No binary data exists on item!');
                            }

                            const binaryProperty = items[i].binary![binaryPropertyName];

                            if (binaryProperty === undefined) {
                                throw new NodeOperationError(this.getNode(), `No binary data property "${binaryPropertyName}" exists on item!`);
                            }

                            // For direct binary upload, send the binary data with the proper Content-Type
                            responseData = await heyGenApiRequest.call(
                                this,
                                'POST',
                                '/asset',
                                {},
                                {},
                                {
                                    binary: true,
                                    binaryData: Buffer.from(binaryProperty.data, 'base64'),
                                    mimeType: binaryProperty.mimeType,
                                }
                            );
                        } else {
                            // File URL option
                            const fileUrl = this.getNodeParameter('fileUrl', i) as string;
                            
                            if (!fileUrl) {
                                throw new NodeOperationError(this.getNode(), 'File URL is required!');
                            }

                            // For URL-based uploads, we'll need to fetch the file first and then upload it
                            const fileResponse = await this.helpers.request({
                                method: 'GET',
                                uri: fileUrl,
                                encoding: null, // Return body as Buffer
                            });
                            
                            // Determine MIME type from URL (simple approach)
                            let mimeType = 'application/octet-stream';
                            if (fileUrl.endsWith('.jpg') || fileUrl.endsWith('.jpeg')) {
                                mimeType = 'image/jpeg';
                            } else if (fileUrl.endsWith('.png')) {
                                mimeType = 'image/png';
                            } else if (fileUrl.endsWith('.mp4')) {
                                mimeType = 'video/mp4';
                            } else if (fileUrl.endsWith('.webm')) {
                                mimeType = 'video/webm';
                            } else if (fileUrl.endsWith('.mp3')) {
                                mimeType = 'audio/mpeg';
                            }
                            
                            // Upload the file using binary mode
                            responseData = await heyGenApiRequest.call(
                                this,
                                'POST',
                                '/asset',
                                {},
                                {},
                                {
                                    binary: true,
                                    binaryData: fileResponse,
                                    mimeType: mimeType,
                                }
                            );
                        }
                    }
                }

                const executionData = this.helpers.constructExecutionMetaData(
                    this.helpers.returnJsonArray(responseData),
                    { itemData: { item: i } }
                );
                returnData.push(...executionData);
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                    continue;
                }
                throw error;
            }
        }

        return [returnData];
    }
}
