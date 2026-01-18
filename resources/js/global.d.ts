import { AxiosInstance } from 'axios';
import { Config } from 'ziggy-js';

declare global {
    interface Window {
        axios: AxiosInstance;
    }

    /* Memberitahu TypeScript tentang fungsi route() global */
    var route: {
        (name?: string, params?: any, absolute?: boolean, config?: Config): string;
        (): any;
    };
}
