import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:8000";
const OWNER_API = `${BASE_URL}/api`;

export const ownerApi = createApi({
    reducerPath: "ownerApi",
    baseQuery: fetchBaseQuery({
        baseUrl: OWNER_API,
        credentials: "include",
    }),
    tagTypes: ["Owner"],
    endpoints: (builder) => ({
        // ✅ fetch ShopData of owner from backend
        loadMyShopData: builder.query({
            query: () => ({
                url: "shop/get-myshop", // backend route: GET /api/shop/get-myshop
                method: "GET"
            }),
            transformResponse: (response) => response ?? null,
            providesTags: ["Owner"],
        }),
        createOrEditShop: builder.mutation({
            query: (formData) => ({
                url: "/shop/create-edit",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Owner"],
        }),
    }),
});

export const {
    useLoadMyShopDataQuery, // ✅ fetch user on refresh
    useCreateOrEditShopMutation
} = ownerApi;
