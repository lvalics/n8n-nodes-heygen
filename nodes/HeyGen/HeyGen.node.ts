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
        name: 'HeyGen',
        icon: 'file:heygen.svg',
        group: ['ai', 'contentCreation'],
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
                    {
                        name: 'Video',
                        value: 'video',
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
                    {
                        name: 'List All Avatars and Talking Photos',
                        value: 'listAllAvatars',
                        description: 'List all avatars and talking photos',
                        action: 'List all avatars and talking photos',
                    },
                    {
                        name: 'List All Voices',
                        value: 'listAllVoices',
                        description: 'List all AI voices',
                        action: 'List all AI voices',
                    },
                    {
                        name: 'List Avatar Groups (personal avatar)',
                        value: 'listAvatarGroups',
                        description: 'List all avatar groups',
                        action: 'List all avatar groups',
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

            // No parameters needed for List All Avatars and List All Voices as filtering is done server-side

            // VIDEO OPERATIONS
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: [
                            'video',
                        ],
                    },
                },
                options: [
                    {
                        name: 'Create Video',
                        value: 'createVideo',
                        description: 'Create a video with AI Studio',
                        action: 'Create a video with AI Studio',
                    },
                    {
                        name: 'Create WebM Video',
                        value: 'createWebmVideo',
                        description: 'Create a WebM video',
                        action: 'Create a WebM video',
                    },
                    {
                        name: 'Get Video Status',
                        value: 'getVideoStatus',
                        description: 'Get video status and details',
                        action: 'Get video status and details',
                    },
                ],
                default: 'createVideo',
            },

            // Create Video Parameters
            {
                displayName: 'Caption',
                name: 'caption',
                type: 'boolean',
                displayOptions: {
                    show: {
                        resource: ['video'],
                        operation: ['createVideo'],
                    },
                },
                default: false,
                description: 'Whether to add a caption to the video. Default is False. Only text input supports caption',
            },
            {
                displayName: 'Title',
                name: 'title',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['video'],
                        operation: ['createVideo'],
                    },
                },
                default: '',
                description: 'Title for the video',
            },
            {
                displayName: 'Callback ID',
                name: 'callbackId',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['video'],
                        operation: ['createVideo'],
                    },
                },
                default: '',
                description: 'A custom ID for callback purposes',
            },
            {
                displayName: 'Callback URL',
                name: 'callbackUrl',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['video'],
                        operation: ['createVideo'],
                    },
                },
                default: '',
                description: 'An optional callback URL to receive a notification when the video is ready',
            },
            {
                displayName: 'Folder ID',
                name: 'folderId',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['video'],
                        operation: ['createVideo'],
                    },
                },
                default: '',
                description: 'Specify the video output folder destination',
            },
            {
                displayName: 'Video Dimensions',
                name: 'dimension',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: false,
                },
                displayOptions: {
                    show: {
                        resource: ['video'],
                        operation: ['createVideo'],
                    },
                },
                default: {},
                options: [
                    {
                        name: 'dimensionValues',
                        displayName: 'Dimension',
                        values: [
                            {
                                displayName: 'Width',
                                name: 'width',
                                type: 'number',
                                default: 1280,
                                description: 'Width of the video in pixels',
                            },
                            {
                                displayName: 'Height',
                                name: 'height',
                                type: 'number',
                                default: 720,
                                description: 'Height of the video in pixels',
                            },
                        ],
                    },
                ],
                description: 'The dimensions of the output video',
            },
            {
                displayName: 'Video Input Scenes',
                name: 'videoInput',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                },
                displayOptions: {
                    show: {
                        resource: ['video'],
                        operation: ['createVideo'],
                    },
                },
                default: {},
                options: [
                    {
                        name: 'videoInputValues',
                        displayName: 'Video Input',
                        values: [
                            {
                                displayName: 'Character Type',
                                name: 'characterType',
                                type: 'options',
                                options: [
                                    {
                                        name: 'Avatar',
                                        value: 'avatar',
                                    },
                                    {
                                        name: 'Talking Photo',
                                        value: 'talking_photo',
                                    },
                                ],
                                default: 'avatar',
                                description: 'Type of character to use in the video',
                            },
                            {
                                displayName: 'Avatar ID',
                                name: 'avatarId',
                                type: 'string',
                                displayOptions: {
                                    show: {
                                        characterType: ['avatar'],
                                    },
                                },
                                default: '',
                                description: 'Avatar ID to use in the video. Please note that this is NOT the Avatar Group ID',
                            },
                            {
                                displayName: 'Talking Photo ID',
                                name: 'talkingPhotoId',
                                type: 'string',
                                displayOptions: {
                                    show: {
                                        characterType: ['talking_photo'],
                                    },
                                },
                                default: '',
                                description: 'Talking Photo ID to use in the video',
                            },
                            {
                                displayName: 'Voice Type',
                                name: 'voiceType',
                                type: 'options',
                                options: [
                                    {
                                        name: 'Text',
                                        value: 'text',
                                    },
                                    {
                                        name: 'Audio',
                                        value: 'audio',
                                    },
                                    {
                                        name: 'Silence',
                                        value: 'silence',
                                    },
                                ],
                                default: 'text',
                                description: 'Type of voice input for the character',
                            },
                            {
                                displayName: 'Voice ID',
                                name: 'voiceId',
                                type: 'string',
                                displayOptions: {
                                    show: {
                                        voiceType: ['text'],
                                    },
                                },
                                default: '',
                                description: 'Voice ID to use for text-to-speech',
                            },
                            {
                                displayName: 'Input Text',
                                name: 'inputText',
                                type: 'string',
                                typeOptions: {
                                    rows: 4,
                                },
                                displayOptions: {
                                    show: {
                                        voiceType: ['text'],
                                    },
                                },
                                default: '',
                                description: 'Text that the character will speak',
                            },
                            {
                                displayName: 'Voice Locale',
                                name: 'locale',
                                type: 'string',
                                displayOptions: {
                                    show: {
                                        voiceType: ['text'],
                                    },
                                },
                                default: '',
                                description: 'Voice accents/locales for multilingual voices',
                            },
                            {
                                displayName: 'Emotion',
                                name: 'emotion',
                                type: 'string',
                                displayOptions: {
                                    show: {
                                        voiceType: ['text'],
                                    },
                                },
                                default: '',
                                description: 'Adds emotion to voice, if supported. (Excited, Friendly, Serious, Soothing, Broadcaster)',
                            },
                            {
                                displayName: 'Voice Speed',
                                name: 'speed',
                                type: 'number',
                                typeOptions: {
                                    minValue: 0.5,
                                    maxValue: 1.5,
                                },
                                displayOptions: {
                                    show: {
                                        voiceType: ['text'],
                                    },
                                },
                                default: 1,
                                description: 'Speed of the voice, between 0.5 and 1.5',
                            },
                            {
                                displayName: 'Audio URL',
                                name: 'audioUrl',
                                type: 'string',
                                displayOptions: {
                                    show: {
                                        voiceType: ['audio'],
                                    },
                                },
                                default: '',
                                description: 'URL of the audio file to use',
                            },
                            {
                                displayName: 'Silence Duration',
                                name: 'duration',
                                type: 'number',
                                typeOptions: {
                                    minValue: 1,
                                    maxValue: 100,
                                },
                                displayOptions: {
                                    show: {
                                        voiceType: ['silence'],
                                    },
                                },
                                default: 1,
                                description: 'Duration of silence in seconds (1-100)',
                            },
                            {
                                displayName: 'Background Type',
                                name: 'backgroundType',
                                type: 'options',
                                options: [
                                    {
                                        name: 'Color',
                                        value: 'color',
                                    },
                                    {
                                        name: 'Image',
                                        value: 'image',
                                    },
                                    {
                                        name: 'Video',
                                        value: 'video',
                                    },
                                ],
                                default: 'color',
                                description: 'Type of background to use',
                            },
                            {
                                displayName: 'Background Color',
                                name: 'backgroundColor',
                                type: 'color',
                                displayOptions: {
                                    show: {
                                        backgroundType: ['color'],
                                    },
                                },
                                default: '#f6f6fc',
                                description: 'Color to use as background (hex format)',
                            },
                            {
                                displayName: 'Background Image URL',
                                name: 'backgroundImageUrl',
                                type: 'string',
                                displayOptions: {
                                    show: {
                                        backgroundType: ['image'],
                                    },
                                },
                                default: '',
                                description: 'URL of the image to use as background',
                            },
                            {
                                displayName: 'Background Video URL',
                                name: 'backgroundVideoUrl',
                                type: 'string',
                                displayOptions: {
                                    show: {
                                        backgroundType: ['video'],
                                    },
                                },
                                default: '',
                                description: 'URL of the video to use as background',
                            },
                        ],
                    },
                ],
                description: 'Video input settings (scenes). Each input describes a scene in the video',
            },

            // Get Video Status Parameters
            {
                displayName: 'Video ID',
                name: 'videoId',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['video'],
                        operation: ['getVideoStatus'],
                    },
                },
                default: '',
                required: true,
                description: 'ID of the video to check status for',
            },

            // Create WebM Video Parameters
            {
                displayName: 'Avatar Pose ID',
                name: 'avatarPoseId',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['video'],
                        operation: ['createWebmVideo'],
                    },
                },
                default: 'Vanessa-invest-20220722',
                description: 'The ID of the avatar\'s pose',
            },
            {
                displayName: 'Avatar Style',
                name: 'avatarStyle',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['video'],
                        operation: ['createWebmVideo'],
                    },
                },
                options: [
                    { name: 'Normal', value: 'normal' },
                    { name: 'Circle', value: 'circle' },
                    { name: 'Close Up', value: 'closeUp' },
                    { name: 'Voice Only', value: 'voiceOnly' },
                ],
                default: 'normal',
                description: 'The style of the avatar',
            },
            {
                displayName: 'Input Method',
                name: 'inputMethod',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['video'],
                        operation: ['createWebmVideo'],
                    },
                },
                options: [
                    { name: 'Text', value: 'text' },
                    { name: 'Audio', value: 'audio' },
                ],
                default: 'text',
                description: 'Method to provide input (text or audio)',
            },
            {
                displayName: 'Input Text',
                name: 'inputText',
                type: 'string',
                typeOptions: {
                    rows: 4,
                },
                displayOptions: {
                    show: {
                        resource: ['video'],
                        operation: ['createWebmVideo'],
                        inputMethod: ['text'],
                    },
                },
                default: 'This is a WebM video generated by HeyGen API',
                description: 'The text that the avatar will speak in the video',
            },
            {
                displayName: 'Voice ID',
                name: 'voiceId',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['video'],
                        operation: ['createWebmVideo'],
                        inputMethod: ['text'],
                    },
                },
                default: '1bd001e7e50f421d891986aad5158bc8',
                description: 'The ID of the voice that the avatar will use',
            },
            {
                displayName: 'Input Audio',
                name: 'inputAudio',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['video'],
                        operation: ['createWebmVideo'],
                        inputMethod: ['audio'],
                    },
                },
                default: '',
                description: 'URL of the input audio file',
            },
            {
                displayName: 'Video Dimensions',
                name: 'webmDimension',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: false,
                },
                displayOptions: {
                    show: {
                        resource: ['video'],
                        operation: ['createWebmVideo'],
                    },
                },
                default: {},
                options: [
                    {
                        name: 'dimensionValues',
                        displayName: 'Dimension',
                        values: [
                            {
                                displayName: 'Width',
                                name: 'width',
                                type: 'number',
                                default: 1280,
                                description: 'Width of the video in pixels',
                            },
                            {
                                displayName: 'Height',
                                name: 'height',
                                type: 'number',
                                default: 720,
                                description: 'Height of the video in pixels',
                            },
                        ],
                    },
                ],
                description: 'The dimensions of the output video',
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
                    } else if (operation === 'listAllAvatars') {
                        // List all avatars
                        responseData = await heyGenApiRequest.call(
                            this,
                            'GET',
                            '/avatars',
                            {},
                            {},
                            {},
                            'api',
                            'v2'
                        );
                    } else if (operation === 'listAllVoices') {
                        // List all voices
                        responseData = await heyGenApiRequest.call(
                            this,
                            'GET',
                            '/voices',
                            {},
                            {},
                            {},
                            'api',
                            'v2'
                        );
                    } else if (operation === 'listAvatarGroups') {
                        // List all avatar groups
                        responseData = await heyGenApiRequest.call(
                            this,
                            'GET',
                            '/avatar_group.list',
                            {},
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
                } else if (resource === 'video') {
                if (operation === 'createVideo') {
                    // Create a video with AI Studio
                    const body: IDataObject = {
                        caption: this.getNodeParameter('caption', i) as boolean,
                    };

                    // Add optional fields
                    const title = this.getNodeParameter('title', i, '') as string;
                    if (title) {
                        body.title = title;
                    }

                    const callbackId = this.getNodeParameter('callbackId', i, '') as string;
                    if (callbackId) {
                        body.callback_id = callbackId;
                    }

                    const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;
                    if (callbackUrl) {
                        body.callback_url = callbackUrl;
                    }

                    const folderId = this.getNodeParameter('folderId', i, '') as string;
                    if (folderId) {
                        body.folder_id = folderId;
                    }

                    // Set video dimensions
                    const dimension = this.getNodeParameter('dimension', i) as IDataObject;
                    if (dimension && dimension.dimensionValues) {
                        body.dimension = (dimension.dimensionValues as IDataObject);
                    } else {
                        body.dimension = {
                            width: 1280,
                            height: 720,
                        };
                    }

                    // Set video inputs (scenes)
                    const videoInputs = this.getNodeParameter('videoInput.videoInputValues', i, []) as IDataObject[];
                    if (videoInputs && videoInputs.length > 0) {
                        body.video_inputs = videoInputs.map((input: IDataObject) => {
                            const videoInput: IDataObject = {};

                            // Set character
                            if (input.characterType === 'avatar') {
                                videoInput.character = {
                                    type: 'avatar',
                                    avatar_id: input.avatarId,
                                    scale: input.scale || 1.0,
                                    avatar_style: input.avatarStyle || 'normal',
                                    offset: {
                                        x: input.offsetX || 0.0,
                                        y: input.offsetY || 0.0,
                                    },
                                };
                            } else if (input.characterType === 'talking_photo') {
                                videoInput.character = {
                                    type: 'talking_photo',
                                    talking_photo_id: input.talkingPhotoId,
                                    scale: input.scale || 1.0,
                                    talking_photo_style: input.talkingPhotoStyle || 'square',
                                    offset: {
                                        x: input.offsetX || 0.0,
                                        y: input.offsetY || 0.0,
                                    },
                                    talking_style: input.talkingStyle || 'stable',
                                    expression: input.expression || 'default',
                                };
                            }

                            // Set voice
                            if (input.voiceType === 'text') {
                                videoInput.voice = {
                                    type: 'text',
                                    voice_id: input.voiceId,
                                    input_text: input.inputText,
                                    locale: input.locale,
                                    emotion: input.emotion,
                                    speed: input.speed || 1.0,
                                };
                            } else if (input.voiceType === 'audio') {
                                videoInput.voice = {
                                    type: 'audio',
                                    audio_url: input.audioUrl,
                                };
                            } else if (input.voiceType === 'silence') {
                                videoInput.voice = {
                                    type: 'silence',
                                    duration: input.duration || 1.0,
                                };
                            }

                            // Set background
                            if (input.backgroundType === 'color') {
                                videoInput.background = {
                                    type: 'color',
                                    value: input.backgroundColor || '#f6f6fc',
                                };
                            } else if (input.backgroundType === 'image') {
                                videoInput.background = {
                                    type: 'image',
                                    url: input.backgroundImageUrl,
                                    fit: input.backgroundFit || 'cover',
                                };
                            } else if (input.backgroundType === 'video') {
                                videoInput.background = {
                                    type: 'video',
                                    url: input.backgroundVideoUrl,
                                    play_style: input.backgroundPlayStyle || 'fit_to_scene',
                                    fit: input.backgroundFit || 'cover',
                                };
                            }

                            return videoInput;
                        });
                    } else {
                        throw new NodeOperationError(this.getNode(), 'At least one video input scene is required');
                    }

                    responseData = await heyGenApiRequest.call(
                        this,
                        'POST',
                        '/video/generate',
                        body,
                        {},
                        {},
                        'api',
                        'v2'
                    );
                } else if (operation === 'getVideoStatus') {
                    // Get video status
                    const videoId = this.getNodeParameter('videoId', i) as string;

                    responseData = await heyGenApiRequest.call(
                        this,
                        'GET',
                        '/video_status.get',
                        {},
                        { video_id: videoId },
                        {},
                        'api',
                        'v1'
                    );
                } else if (operation === 'createWebmVideo') {
                    // Create a WebM video
                    const body: IDataObject = {
                        avatar_pose_id: this.getNodeParameter('avatarPoseId', i) as string,
                        avatar_style: this.getNodeParameter('avatarStyle', i) as string,
                    };

                    const inputMethod = this.getNodeParameter('inputMethod', i) as string;
                    if (inputMethod === 'text') {
                        body.input_text = this.getNodeParameter('inputText', i) as string;
                        body.voice_id = this.getNodeParameter('voiceId', i) as string;
                        body.locale = this.getNodeParameter('locale', i) as string;
                        body.emotion = this.getNodeParameter('emotion', i) as string;
                    } else if (inputMethod === 'audio') {
                        body.input_audio = this.getNodeParameter('inputAudio', i) as string;
                    }

                    // Set video dimensions
                    const webmDimension = this.getNodeParameter('webmDimension', i) as IDataObject;
                    if (webmDimension && webmDimension.dimensionValues) {
                        body.dimension = (webmDimension.dimensionValues as IDataObject);
                    } else {
                        body.dimension = {
                            width: 1280,
                            height: 720,
                        };
                    }

                    responseData = await heyGenApiRequest.call(
                        this,
                        'POST',
                        '/video.webm',
                        body,
                        {},
                        {},
                        'api',
                        'v1'
                    );
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
