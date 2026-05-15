import crypto from 'node:crypto';

export type SourceItem = {
    sourceItemId: string,
    sourceItemUrl: string,
    /** ISO 8601 format date string, e.g. "2024-01-01T12:00:00.000Z" */
    sourceItemLastUpdatedAt: string,
    /** ISO 8601 format date string, e.g. "2024-01-01T12:00:00.000Z" */
    sourceItemCreatedAt: string,
    displayName: string,
    body: string | null,
    additionalSearchTerms: string[]
}

export type SourceItemResponse = SourceItem & {
    hash: string,
}

export type ApiOptions = {
    connectorId: string,
    apiKey: string,
    apiUrl?: string
}

type FetchRequestOptions = {
    route: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any
}

export class SearchConnectorApi {
    private connectorId: string;
    private apiKey: string;
    private apiUrl: string;
    private headers: Headers;
    
    constructor({connectorId, apiKey, apiUrl}: ApiOptions) {
        this.connectorId = connectorId;
        this.apiKey = apiKey;
        this.apiUrl = apiUrl || 'https://api.knowledge-architecture.com/api';
        this.headers = this.constructHeaders();
    }

    private constructHeaders() {
        const apiKeyHeader = this.connectorId + ":" + this.apiKey;
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-Api-Key", apiKeyHeader);
        myHeaders.append("Accept", "application/json");
        return myHeaders;
    }

    private async fetchRequest(options: FetchRequestOptions) {
        const fullUrl = this.apiUrl + options.route;

        const fetchOptions: RequestInit = {
            method: options.method,
            headers: this.headers
        };

        if (options.body) {
            fetchOptions.body = JSON.stringify(options.body);
        }
        return fetch(fullUrl, fetchOptions);
    }

    private async parseResponse<T>(response: Response): Promise<T | null> {
        const responseText = await response.text();
        const responseStatus = response.status;
        if (!response.ok) {
            console.error(`API request failed with status ${responseStatus}: ${responseText}`);
            return null;
        }
        
        try {
            return JSON.parse(responseText) as T;
        } catch (e) {
            console.error('Failed to parse response as JSON:', e);
            return null;
        }
    }

    public async getSourceItems() {
        const response = await this.fetchRequest({
            method: 'GET',
            route: '/SourceItem'
        });

        return this.parseResponse<SourceItemResponse[]>(response);
    }

    public async getSourceItemById(sourceItemId: string) {
        const response = await this.fetchRequest({
            method: 'GET',
            route: `/SourceItem/${sourceItemId}`
        });

        return this.parseResponse<SourceItemResponse>(response);
    }

    public async submitSourceItem(sourceItem: SourceItem) {

        const response = await this.fetchRequest({
            method: 'PUT',
            route: '/SourceItem',
            body: sourceItem
        });

        return this.parseResponse<SourceItemResponse>(response);
    }

    public async deleteSourceItemById(sourceItemId: string) {
        const response = await this.fetchRequest({
            method: 'DELETE',
            route: `/SourceItem/${sourceItemId}`
        });

        return this.parseResponse(response);
    }

    public calculateMd5Hash(sourceItem: SourceItem) {
        const additionalTermsString = sourceItem.additionalSearchTerms === null ? JSON.stringify([]) : JSON.stringify(sourceItem.additionalSearchTerms);
        const hash = crypto.createHash('md5');
        const dataToHash = [
            sourceItem.displayName,
            sourceItem.body,
            additionalTermsString,
            new URL(sourceItem.sourceItemUrl).toString(),
            sourceItem.sourceItemCreatedAt.toString(),
            sourceItem.sourceItemLastUpdatedAt.toString()
        ].join(" ");
        hash.update(dataToHash, 'utf-8');
        return hash.digest('hex').toUpperCase();
    }
}


