"use client";

import {
    initClient,
    initClientNavigation,
    fetchTransport,
    navigate,
} from "rwsdk/client";

const { handleResponse } = initClientNavigation();

initClient({
    transport: fetchTransport,
    handleResponse,
});

export { navigate };
