import {
    IExecuteFunctions,
    IExecuteSingleFunctions,
    IHookFunctions,
    ILoadOptionsFunctions,
    IHttpRequestMethods,
		IDataObject,
    NodeApiError,
    JsonObject,
    IRequestOptions
} from 'n8n-workflow';


export async function heyGenApiRequest(
    this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body: IDataObject = {},
    qs: IDataObject = {},
    options: IDataObject = {},
) {
    const credentials = await this.getCredentials('heyGenApi');

    const requestOptions: IRequestOptions = {
        headers: {
            'X-Api-Key': credentials.apiKey as string,
        },
        method,
        qs,
        uri: `https://upload.heygen.com/v1${endpoint}`,
        json: false, // Default to false
    };
    
    if (options.binary) {
        // For binary uploads, set the content-type header and raw body
        requestOptions.headers!['Content-Type'] = options.mimeType as string;
        requestOptions.body = options.binaryData;
        requestOptions.json = false; // Ensure JSON is disabled
    } else if (options.formData) {
        // For form data uploads
        requestOptions.formData = options.formData as IDataObject;
    } else {
        // For JSON requests
        requestOptions.body = body;
        requestOptions.json = true;
    }

    try {
        const response = await this.helpers.request!(requestOptions);
        
        // If we're getting a string response, try to parse it as JSON
        if (typeof response === 'string' && response.trim().startsWith('{')) {
            try {
                return JSON.parse(response);
            } catch (parseError) {
                // If parsing fails, return the original string
                return response;
            }
        }
        
        return response;
    } catch (error) {
        throw new NodeApiError(this.getNode(), error as JsonObject);
    }
}
