import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const USER_API = "http://localhost:8000/api/user";

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: fetchBaseQuery({
        baseUrl: USER_API,
        credentials: "include",
    }),
    tagTypes: ["User"],
    endpoints: (builder) => ({
        loadUser: builder.query({   
            query: () => ({
                url: "profile",        //     /api/user/profile
                method: "GET"
            }),
            transformResponse: (response) => response.user,
            providesTags: ["User"],
        }),
        updateUserData: builder.mutation({
            query: (formData) => ({
                url: "update",        //       /api/user/update
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["User"],
        }),
        updateUserAddress: builder.mutation({
            query: (addressData) => ({
                url: "update",
                method: "PUT",
                body: addressData,
            }),
            invalidatesTags: ["User"],
        }),
        uploadProfileImage: builder.mutation({
            query: (formData) => ({
                url: "upload",
                method: "POST",
                body: formData,
            }),
        }),
    }),
});

export const {
    useLoadUserQuery,
    useUpdateUserDataMutation,
    useUpdateUserAddressMutation,
    useUploadProfileImageMutation,
} = userApi;