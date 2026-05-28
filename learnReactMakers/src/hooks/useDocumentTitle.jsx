import { useEffect } from "react";

const APP_NAME = " ";

export function useDocumentTitle(pageTitle) {
    useEffect(() => {
        const prevTitle = document.title;
        document.title = pageTitle ? `${pageTitle} ` : APP_NAME;

        return() => {
            document.title = prevTitle;
        };
    }, [pageTitle]);
}