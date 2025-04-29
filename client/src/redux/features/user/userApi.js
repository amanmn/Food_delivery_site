// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// const USER_API = "http://localhost:8000/user";

// export const userApi = createApi({
//     reducerPath: "userApi",
//     baseQuery: fetchBaseQuery({
//         baseUrl: USER_API,
//         credentials: "include",
//         prepareHeaders: (headers) => {
//             const token = localStorage.getItem("token");
//             if (token) {
//                 headers.set("Authorization", `Bearer ${token}`);
//             }
//             return headers;
//         },
//     }),
//     endpoints: (builder) => ({
//         updateUserAddress: builder.mutation({
//             query: (addressData) => ({
//                 url: "update",
//                 method: "PUT",
//                 body: addressData,
//             }),
//             invalidatesTags: ["User"],
//         }),
//     }),
// });

// export const { useUpdateUserAddressMutation } = userApi;
