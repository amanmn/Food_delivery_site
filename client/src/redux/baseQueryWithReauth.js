import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASEURL
        ? `${import.meta.env.VITE_BASEURL.replace(/\/$/, "")}/`
        : "/api",

    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth?.user?.token;

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        return headers;
    },
});

// only stores the current refresh request
let refreshPromise = null;

export const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(
        args,
        api,
        extraOptions
    );

    // server return 401?
    if (result?.error?.status === 401) {
        console.log("Access token expired");

        // refresh is already running than wait for it
        if (!refreshPromise) {
            console.log("Starting refresh request...");

            // ask backend for new access token
            refreshPromise = await baseQuery(
                {
                    url: "/auth/refresh-token",
                    method: "POST",
                },
                api,
                extraOptions
            ).finally(() => {
                refreshPromise = null;
            });
        } else {
            console.log("Refresh already running. Waiting...");
        }

        const refreshResult = await refreshPromise;

        // refresh successful?
        if (refreshResult?.data) {
            console.log("Token refreshed successfully");

            // retry original request
            result = await baseQuery(
                args,
                api,
                extraOptions
            )
        } else {
            console.log("Refresh token expired. Login again.")
        }
    }
    return result;
};