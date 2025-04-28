import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeOperationError,
    NodeConnectionType,
    IDataObject,
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
                    {
                        name: 'Photo Avatar',
                        value: 'photoAvatar',
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

            // PHOTO AVATAR OPERATIONS
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: [
                            'photoAvatar',
                        ],
                    },
                },
                options: [
                    {
                        name: 'Generate Photo',
                        value: 'generatePhoto',
                        description: 'Generate photo avatar photos',
                        action: 'Generate photo avatar photos',
                    },
                    {
                        name: 'Check Generation Status',
                        value: 'checkGenerationStatus',
                        description: 'Check photo/look generation status',
                        action: 'Check photo look generation status',
                    },
                    {
                        name: 'Create Avatar Group',
                        value: 'createAvatarGroup',
                        description: 'Create photo avatar group',
                        action: 'Create photo avatar group',
                    },
                    {
                        name: 'Add Looks',
                        value: 'addLooks',
                        description: 'Add looks to photo avatar group',
                        action: 'Add looks to photo avatar group',
                    },
                    {
                        name: 'Train Avatar Group',
                        value: 'trainAvatarGroup',
                        description: 'Train photo avatar group',
                        action: 'Train photo avatar group',
                    },
                    {
                        name: 'Get Training Status',
                        value: 'getTrainingStatus',
                        description: 'Get training job status',
                        action: 'Get training job status',
                    },
                    {
                        name: 'Generate Avatar Looks',
                        value: 'generateAvatarLooks',
                        description: 'Generate photo avatar looks',
                        action: 'Generate photo avatar looks',
                    },
                    {
                        name: 'Get Avatar Details',
                        value: 'getAvatarDetails',
                        description: 'Get photo avatar details',
                        action: 'Get photo avatar details',
                    },
                    {
                        name: 'Add Motion',
                        value: 'addMotion',
                        description: 'Add motion to an existing photo avatar',
                        action: 'Add motion to an existing photo avatar',
                    },
                    {
                        name: 'Add Sound Effect',
                        value: 'addSoundEffect',
                        description: 'Add sound effect to a photo avatar',
                        action: 'Add sound effect to a photo avatar',
                    },
                    {
                        name: 'Upscale Avatar',
                        value: 'upscaleAvatar',
                        description: 'Upscale an avatar',
                        action: 'Upscale an avatar',
                    },
                ],
                default: 'generatePhoto',
            },

            // Generate Photo Parameters
            {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['generatePhoto'],
                    },
                },
                default: '',
                description: 'Name for the generated avatar',
            },
            {
                displayName: 'Age',
                name: 'age',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['generatePhoto'],
                    },
                },
                options: [
                    { name: 'Young Adult', value: 'Young Adult' },
                    { name: 'Early Middle Age', value: 'Early Middle Age' },
                    { name: 'Late Middle Age', value: 'Late Middle Age' },
                    { name: 'Senior', value: 'Senior' },
                    { name: 'Unspecified', value: 'Unspecified' },
                ],
                default: 'Young Adult',
                description: 'Age for the generated avatar',
            },
            {
                displayName: 'Gender',
                name: 'gender',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['generatePhoto'],
                    },
                },
                options: [
                    { name: 'Man', value: 'Man' },
                    { name: 'Woman', value: 'Woman' },
										{ name: 'Unspecified', value: 'Unspecified' },
                ],
                default: 'Man',
                description: 'Gender for the generated avatar',
            },
            {
                displayName: 'Ethnicity',
                name: 'ethnicity',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['generatePhoto'],
                    },
                },
                options: [
                    { name: 'White', value: 'White' },
                    { name: 'Black', value: 'Black' },
                    { name: 'Asian American', value: 'Asian American' },
                    { name: 'East Asian', value: 'East Asian' },
                    { name: 'South East Asian', value: 'South East Asian' },
                    { name: 'South Asian', value: 'South Asian' },
                    { name: 'Middle Eastern', value: 'Middle Eastern' },
                    { name: 'Pacific', value: 'Pacific' },
                    { name: 'Hispanic', value: 'Hispanic' },
                    { name: 'Unspecified', value: 'Unspecified' },
                ],
                default: 'Unspecified',
                description: 'Ethnicity for the generated avatar',
            },
            {
                displayName: 'Orientation',
                name: 'orientation',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['generatePhoto'],
                    },
                },
                options: [
                    { name: 'Vertical', value: 'vertical' },
                    { name: 'Horizontal', value: 'horizontal' },
                    { name: 'Square', value: 'square' },
                ],
                default: 'vertical',
                description: 'Orientation for the generated avatar',
            },
            {
                displayName: 'Pose',
                name: 'pose',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['generatePhoto'],
                    },
                },
                options: [
                    { name: 'Close Up', value: 'close_up' },
                    { name: 'Half Body', value: 'half_body' },
                    { name: 'Full Body', value: 'full_body' },
                ],
                default: 'close_up',
                description: 'Pose for the generated avatar',
            },
            {
                displayName: 'Style',
                name: 'style',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['generatePhoto'],
                    },
                },
                options: [
                    { name: 'Realistic', value: 'Realistic' },
                    { name: 'Pixar', value: 'Pixar' },
                    { name: 'Cinematic', value: 'Cinematic' },
                    { name: 'Vintage', value: 'Vintage' },
                    { name: 'Noir', value: 'Noir' },
                    { name: 'Cyberpunk', value: 'Cyberpunk' },
                    { name: 'Unspecified', value: 'Unspecified' },
                ],
                default: 'Realistic',
                description: 'Style for the generated avatar',
            },
            {
                displayName: 'Appearance Description',
                name: 'appearance',
                type: 'string',
                typeOptions: {
                    rows: 4, // Makes it a multiline text field
                },
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['generatePhoto'],
                    },
                },
                default: 'Professional looking person with a warm smile',
                required: true,
                description: 'Description/Prompt of the generated avatar photo (max 1000 characters). Examples: "Professional looking person with a warm smile", "Person with glasses wearing a business suit", "Athletic person with short hair outdoors", "Creative artist with colorful clothing in a studio"',
            },
            {
                displayName: 'Callback URL',
                name: 'callbackUrl',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['generatePhoto'],
                    },
                },
                default: '',
                required: false,
                description: 'Callback URL to get notification when generation will be completed',
            },
            {
                displayName: 'Callback ID',
                name: 'callbackId',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['generatePhoto'],
                    },
                },
                default: '',
                required: false,
                description: 'A custom ID for callback purposes',
            },

            // Check Generation Status
            {
                displayName: 'Generation ID',
                name: 'generationId',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['checkGenerationStatus'],
                    },
                },
                default: '',
                required: true,
                description: 'ID of the generation job to check',
            },

            // Create Avatar Group
            {
                displayName: 'Group Name',
                name: 'groupName',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['createAvatarGroup'],
                    },
                },
                default: '',
                required: true,
                description: 'Name for the avatar group',
            },
            {
                displayName: 'Image Key',
                name: 'imageKey',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['createAvatarGroup'],
                    },
                },
                default: '',
                required: true,
                description: 'Image key for the avatar group',
            },
            {
                displayName: 'Generation ID',
                name: 'generationId',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['createAvatarGroup'],
                    },
                },
                default: '',
                description: 'Generation ID used to generate the image',
            },

            // Add Looks to Group
            {
                displayName: 'Group ID',
                name: 'groupId',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['addLooks', 'trainAvatarGroup', 'getTrainingStatus', 'generateAvatarLooks'],
                    },
                },
                default: '',
                required: true,
                description: 'ID of the avatar group',
            },
            {
                displayName: 'Image Keys',
                name: 'imageKeys',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['addLooks'],
                    },
                },
                default: '',
                description: 'Comma-separated list of image keys to add to the group (maximum 4)',
            },
            {
                displayName: 'Look Name',
                name: 'lookName',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['addLooks'],
                    },
                },
                default: '',
                description: 'Name of the look',
            },
            {
                displayName: 'Generation ID',
                name: 'generationId',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['addLooks'],
                    },
                },
                default: '',
                description: 'Generation ID used to generate the images',
            },

            // Generate Avatar Looks
            {
                displayName: 'Prompt',
                name: 'prompt',
                type: 'string',
                typeOptions: {
                    rows: 4, // Makes it a multiline text field
                },
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['generateAvatarLooks', 'addMotion'],
                    },
                },
                default: '',
                required: true,
                description: 'Prompt to generate different looks or movement',
            },
            {
                displayName: 'Orientation',
                name: 'orientation',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['generateAvatarLooks'],
                    },
                },
                options: [
                    { name: 'Vertical', value: 'vertical' },
                    { name: 'Horizontal', value: 'horizontal' },
                    { name: 'Square', value: 'square' },
                ],
                default: 'vertical',
                description: 'Orientation for the avatar looks',
            },
            {
                displayName: 'Pose',
                name: 'pose',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['generateAvatarLooks'],
                    },
                },
                options: [
                    { name: 'Close Up', value: 'close_up' },
                    { name: 'Half Body', value: 'half_body' },
                    { name: 'Full Body', value: 'full_body' },
                ],
                default: 'close_up',
                description: 'Pose for the avatar looks',
            },
            {
                displayName: 'Style',
                name: 'style',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['generateAvatarLooks'],
                    },
                },
                options: [
                    { name: 'Realistic', value: 'Realistic' },
                    { name: 'Pixar', value: 'Pixar' },
                    { name: 'Cinematic', value: 'Cinematic' },
                    { name: 'Vintage', value: 'Vintage' },
                    { name: 'Noir', value: 'Noir' },
                    { name: 'Cyberpunk', value: 'Cyberpunk' },
                    { name: 'Unspecified', value: 'Unspecified' },
                ],
                default: 'Realistic',
                description: 'Style for the avatar looks',
            },

            // Avatar Details, Add Motion, Sound Effect, Upscale
            {
                displayName: 'Avatar ID',
                name: 'avatarId',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['photoAvatar'],
                        operation: ['getAvatarDetails', 'addMotion', 'addSoundEffect', 'upscaleAvatar'],
                    },
                },
                default: '',
                required: true,
                description: 'ID of the avatar',
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
                if (resource === 'photoAvatar') {
                    if (operation === 'generatePhoto') {
                        // Generate photo avatar photos
                        const gender = this.getNodeParameter('gender', i) as string;
                        console.log('Gender value being sent:', gender); // Debug log

                        const body: IDataObject = {
                            name: this.getNodeParameter('name', i) as string,
                            age: this.getNodeParameter('age', i) as string,
                            gender, // Using the variable directly
                            ethnicity: this.getNodeParameter('ethnicity', i) as string,
                            orientation: this.getNodeParameter('orientation', i) as string,
                            pose: this.getNodeParameter('pose', i) as string,
                            style: this.getNodeParameter('style', i) as string,
                            appearance: this.getNodeParameter('appearance', i) as string,
                        };

                        // Add optional callback parameters if provided
                        const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;
                        if (callbackUrl) {
                            body.callback_url = callbackUrl;
                        }

                        const callbackId = this.getNodeParameter('callbackId', i, '') as string;
                        if (callbackId) {
                            body.callback_id = callbackId;
                        }

                        console.log('Full request body:', JSON.stringify(body)); // Debug the full request body

                        responseData = await heyGenApiRequest.call(
                            this,
                            'POST',
                            '/photo_avatar/photo/generate',
                            body,
                            {},
                            {},
                            'api',
                            'v2'
                        );
                    } else if (operation === 'checkGenerationStatus') {
                        // Check photo/look generation status
                        const generationId = this.getNodeParameter('generationId', i) as string;

                        responseData = await heyGenApiRequest.call(
                            this,
                            'GET',
                            `/photo_avatar/generation/${generationId}`,
                            {},
                            {},
                            {},
                            'api',
                            'v2'
                        );
                    } else if (operation === 'createAvatarGroup') {
                        // Create photo avatar group
                        const body: IDataObject = {
                            name: this.getNodeParameter('groupName', i) as string,
                            image_key: this.getNodeParameter('imageKey', i) as string,
                        };

                        const generationId = this.getNodeParameter('generationId', i, '') as string;
                        if (generationId) {
                            body.generation_id = generationId;
                        }

                        responseData = await heyGenApiRequest.call(
                            this,
                            'POST',
                            '/photo_avatar/avatar_group/create',
                            body,
                            {},
                            {},
                            'api',
                            'v2'
                        );
                    } else if (operation === 'addLooks') {
                        // Add looks to photo avatar group
                        const groupId = this.getNodeParameter('groupId', i) as string;
                        const imageKeysString = this.getNodeParameter('imageKeys', i) as string;
                        const imageKeys = imageKeysString.split(',').map(key => key.trim());

                        const body: IDataObject = {
                            group_id: groupId,
                            image_keys: imageKeys,
                        };

                        const lookName = this.getNodeParameter('lookName', i, '') as string;
                        if (lookName) {
                            body.name = lookName;
                        }

                        const generationId = this.getNodeParameter('generationId', i, '') as string;
                        if (generationId) {
                            body.generation_id = generationId;
                        }

                        responseData = await heyGenApiRequest.call(
                            this,
                            'POST',
                            '/photo_avatar/avatar_group/add',
                            body,
                            {},
                            {},
                            'api',
                            'v2'
                        );
                    } else if (operation === 'trainAvatarGroup') {
                        // Train photo avatar group
                        const groupId = this.getNodeParameter('groupId', i) as string;

                        responseData = await heyGenApiRequest.call(
                            this,
                            'POST',
                            '/photo_avatar/train',
                            { group_id: groupId },
                            {},
                            {},
                            'api',
                            'v2'
                        );
                    } else if (operation === 'getTrainingStatus') {
                        // Get training job status
                        const groupId = this.getNodeParameter('groupId', i) as string;

                        responseData = await heyGenApiRequest.call(
                            this,
                            'GET',
                            `/photo_avatar/train/status/${groupId}`,
                            {},
                            {},
                            {},
                            'api',
                            'v2'
                        );
                    } else if (operation === 'generateAvatarLooks') {
                        // Generate photo avatar looks
                        const groupId = this.getNodeParameter('groupId', i) as string;
                        const prompt = this.getNodeParameter('prompt', i) as string;

                        const body: IDataObject = {
                            group_id: groupId,
                            prompt: prompt,
                        };

                        const orientation = this.getNodeParameter('orientation', i, '') as string;
                        if (orientation) {
                            body.orientation = orientation;
                        }

                        const pose = this.getNodeParameter('pose', i, '') as string;
                        if (pose) {
                            body.pose = pose;
                        }

                        const style = this.getNodeParameter('style', i, '') as string;
                        if (style) {
                            body.style = style;
                        }

                        responseData = await heyGenApiRequest.call(
                            this,
                            'POST',
                            '/photo_avatar/look/generate',
                            body,
                            {},
                            {},
                            'api',
                            'v2'
                        );
                    } else if (operation === 'getAvatarDetails') {
                        // Get photo avatar details
                        const avatarId = this.getNodeParameter('avatarId', i) as string;

                        responseData = await heyGenApiRequest.call(
                            this,
                            'GET',
                            `/photo_avatar/${avatarId}`,
                            {},
                            {},
                            {},
                            'api',
                            'v2'
                        );
                    } else if (operation === 'addMotion') {
                        // Add motion to an existing photo avatar
                        const avatarId = this.getNodeParameter('avatarId', i) as string;
                        const prompt = this.getNodeParameter('prompt', i) as string;

                        responseData = await heyGenApiRequest.call(
                            this,
                            'POST',
                            '/photo_avatar/add_motion',
                            {
                                id: avatarId,
                                prompt: prompt,
                            },
                            {},
                            {},
                            'api',
                            'v2'
                        );
                    } else if (operation === 'addSoundEffect') {
                        // Add sound effect to a photo avatar
                        const avatarId = this.getNodeParameter('avatarId', i) as string;

                        responseData = await heyGenApiRequest.call(
                            this,
                            'POST',
                            '/photo_avatar/add_sound_effect',
                            { id: avatarId },
                            {},
                            {},
                            'api',
                            'v2'
                        );
                    } else if (operation === 'upscaleAvatar') {
                        // Upscale an avatar
                        const avatarId = this.getNodeParameter('avatarId', i) as string;

                        responseData = await heyGenApiRequest.call(
                            this,
                            'POST',
                            '/photo_avatar/upscale',
                            { id: avatarId },
                            {},
                            {},
                            'api',
                            'v2'
                        );
                    }
                } else if (resource === 'document') {
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
