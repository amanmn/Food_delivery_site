import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "./authSlice";

const USER_API = "http://localhost:8000/user"

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: USER_API,
        credentials: 'include',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token; // assuming you save token in Redux (recommended!)

            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (formData) => ({
                url: "register",
                method: "POST",
                body: formData
            })
        }),
        loginUser: builder.mutation({
            query: (formData) => ({
                url: "login",
                method: "POST",
                body: formData
            }),
        }),
        updateUserData: builder.mutation({
            query: ({userId, newAddress}) => ({
                url: "update",
                method: "PUT",
                body: { userId, newAddress }
            })
        }),
        loadUser: builder.query({
            query: () => ({
                url: "profile",
                method: "GET"
            }),
                        transformResponse: (response) => response.user, // ensure the user data is returned correctly

        }),
    })
})
export const {
    useRegisterUserMutation,
    useUpdateUserDataMutation,
    useLoginUserMutation,
    useLoadUserQuery
} = authApi