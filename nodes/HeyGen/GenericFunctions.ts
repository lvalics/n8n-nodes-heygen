import {
    IExecuteFunctions,
    IExecuteSingleFunctions,
    IHookFunctions,
    ILoadOptionsFunctions,
    IHttpRequestMethods,
} from 'n8n-workflow';
import { 
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
        body,
        uri: `https://api.heygen.com/v1${endpoint}`,
        json: true,
    };

    if (options.formData) {
        requestOptions.formData = options.formData as IDataObject;
    }

    if (Object.keys(body).length === 0 && !options.formData) {
        delete requestOptions.body;
    }

    try {
        return await this.helpers.request!(requestOptions);
    } catch (error) {
        throw new NodeApiError(this.getNode(), error as JsonObject);
    }
}
