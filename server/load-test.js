const http = require('k6/http');
const { sleep, check } = require('k6');
const BASE_URL = 'https://food-delivery-site-opam.onrender.com/api';

const options = {
    stages: [
        { duration: '20s', target: 20 }, // Ramp up to 20 users over 20 seconds
        { duration: '1m', target: 50 }, // Stay at 50 users for 1 minute
        { duration: '30s', target: 0 },  // Ramp down to 0 users over 10 seconds
    ],

    thresholds: {
        http_req_duration: ['p(95)<800'], // 95% of requests should be below 800ms
        http_req_failed: ['rate<0.02'], // Less than 2% of requests should fail
    },
};

const TOKEN = 'your_jwt_token_here';

const headers = {
    headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
    },
}

export default function () {

    // Public API - get-item-by-city
    const res1 = http.get(`${BASE_URL}/item/get-item-by-city/indore`);

    check(res1, {
        "get-item-by-city success": (r) => r.status === 200,
    });

    sleep(1); // Simulate user think time

    // Public API - Search items
    const res2 = http.get(`${BASE_URL}/item/search-items?query=pizza`);
    check(res2, {
        "search-items success": (r) => r.status === 200,
    });

    sleep(1); // Simulate user think time
}
