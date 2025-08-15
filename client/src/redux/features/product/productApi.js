import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const PRODUCT_API = "http://localhost:8000/api/product";

export const productApi = createApi({
    reducerPath: "productApi",
    baseQuery: fetchBaseQuery({
        baseUrl: PRODUCT_API,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
              headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
          },
    }),
    endpoints: (builder) => ({
        getProductData: builder.query({
            query: () => ({
                url: "getData",
                method: "GET",
            }),
        }),
    }),
})

export const { useGetProductDataQuery } = productApi