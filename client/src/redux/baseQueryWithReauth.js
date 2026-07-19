import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BASEURL
    ? `${import.meta.env.VITE_BASEURL.replace(/\/$/, "")}/auth`
    : "/api/auth",

  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.user?.token;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const baseQueryWithReauth = async (
  args,
  api,
  extraOptions
) => {
    
  let result = await baseQuery(
    args,
    api,
    extraOptions
  );

  // server return 401?
  if (result?.error?.status === 401) {

    console.log(
      "Access token expired. Trying refresh token..."
    );

    // ask backend for new access token
    const refreshResult = await baseQuery(
      {
        url: "refresh-token",
        method: "POST",
      },
      api,
      extraOptions
    );

    // refresh successful?
    if (refreshResult?.data) {
      console.log(
        "Access token refreshed successfully"
      );

      // retry original request
      result = await baseQuery(
        args,
        api,
        extraOptions
      );

    } else {

      console.log(
        "Refresh token expired. Login again."
      );
    }
  }

  return result;
};