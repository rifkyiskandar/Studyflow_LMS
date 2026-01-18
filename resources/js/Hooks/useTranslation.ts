import { usePage } from '@inertiajs/react';

export default function useTranslation() {
    const { translations } = usePage<any>().props;

    const t = (key: string, defaultText: string = key): string => {
        if (translations && translations[key]) {
            return translations[key];
        }

        return defaultText;
    };

    return { t };
}
