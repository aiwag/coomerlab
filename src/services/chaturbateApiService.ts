// // Re-export Streamer type for use in stores/components
// export interface Streamer {
//   display_age: number | null;
//   gender: string;
//   location: string;
//   current_show: string;
//   username: string;
//   tags: string[];
//   is_new: boolean;
//   num_users: number;
//   num_followers: number;
//   start_dt_utc: string;
//   country: string;
//   has_password: boolean;
//   private_price: number;
//   spy_show_price: number;
//   is_gaming: boolean;
//   is_age_verified: boolean;
//   label: string;
//   is_following: boolean;
//   source_name: string;
//   start_timestamp: number;
//   img: string;
//   subject: string;
// }

// interface ApiResponse {
//   rooms: Streamer[];
//   total_count: number;
//   all_rooms_count: number;
// }

// const API_BASE_URL = "https://chaturbate.com/api/ts/roomlist/room-list/";
// const ROOMS_PER_PAGE = 50; // Increased for better UX
// const MAX_RETRIES = 3;
// const RETRY_DELAY = 1500;

// const CHROME_HEADERS = {
//   Accept: "application/json, text/plain, */*",
//   "User-Agent":
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
// };

// async function robustFetch(
//   url: string,
//   options: RequestInit = {},
//   retries = MAX_RETRIES,
// ): Promise<any> {
//   try {
//     const response = await fetch(url, { ...options, headers: CHROME_HEADERS });
//     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//     return await response.json();
//   } catch (error) {
//     if (retries > 0) {
//       await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
//       return robustFetch(url, options, retries - 1);
//     }
//     throw error;
//   }
// }

// export async function getRooms(page: number): Promise<ApiResponse> {
//   const offset = (page - 1) * ROOMS_PER_PAGE;
//   const url = `${API_BASE_URL}?limit=${ROOMS_PER_PAGE}&offset=${offset}`;
//   return await robustFetch(url);
// }

// This service now handles multiple API endpoints and normalizes their different responses.

// Type for the full, detailed room list response
// export interface Streamer {
//   display_age: number | null;
//   gender: string;
//   location: string;
//   current_show: string;
//   username: string;
//   tags: string[];
//   is_new: boolean;
//   num_users: number;
//   num_followers: number;
//   start_dt_utc: string;
//   country: string;
//   is_age_verified: boolean;
//   label: string;
//   img: string;
//   subject: string;
//   // Add other fields that might be missing in CarouselRoom
//   is_following?: boolean;
// }

// // Type for the simplified carousel response (Top Rated, Trending)
// interface CarouselRoom {
//   room: string; // This is the username
//   img: string;
//   gender: string;
//   subject: string;
//   viewers: number;
//   display_age: string | null;
//   country: string;
// }

// interface ListApiResponse {
//   rooms: Streamer[];
//   total_count: number;
// }

// interface CarouselApiResponse {
//   rooms: CarouselRoom[];
// }

// const API_BASE_URL = "https://chaturbate.com/api/ts/";
// const CHROME_HEADERS = {
//   "User-Agent":
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
// };

// /**
//  * Normalizes the simplified CarouselRoom object into the full Streamer object
//  * that the rest of our application expects. This is a crucial step for UI consistency.
//  */
// function normalizeRoomToStreamer(room: CarouselRoom): Streamer {
//   return {
//     username: room.room,
//     img: room.img,
//     gender: room.gender,
//     subject: room.subject,
//     num_users: room.viewers,
//     display_age: room.display_age ? parseInt(room.display_age, 10) : null,
//     country: room.country,
//     // Fill in missing properties with default values
//     tags: [],
//     num_followers: 0,
//     is_new: false,
//     is_age_verified: false, // Cannot be determined from this endpoint
//     location: "",
//     current_show: "public",
//     label: "public",
//     start_dt_utc: new Date().toISOString(),
//   };
// }

// async function robustFetch(url: string): Promise<any> {
//   // Simple fetch, can be enhanced with retries if needed
//   const response = await fetch(url, { headers: CHROME_HEADERS });
//   if (!response.ok)
//     throw new Error(`API request failed: ${response.statusText}`);
//   return response.json();
// }

// // c) Fetch Most Viewed Rooms (Default)
// export async function getMostViewedRooms(
//   page: number = 1,
//   limit: number = 90,
// ): Promise<ListApiResponse> {
//   const offset = (page - 1) * limit;
//   const url = `${API_BASE_URL}roomlist/room-list/?limit=${limit}&offset=${offset}&require_fingerprint=false`;
//   return await robustFetch(url);
// }

// // a) Fetch Rooms by Keyword Search
// export async function searchRooms(
//   keywords: string,
//   page: number = 1,
//   limit: number = 99,
// ): Promise<ListApiResponse> {
//   const offset = (page - 1) * limit;
//   const url = `${API_BASE_URL}roomlist/room-list/?keywords=${encodeURIComponent(keywords)}&limit=${limit}&offset=${offset}&require_fingerprint=false`;
//   return await robustFetch(url);
// }

// // b) Fetch Top Rated Rooms
// export async function getTopRatedRooms(
//   gender: "f" | "m" | "c" | "t" | "" = "",
// ): Promise<ListApiResponse> {
//   const genderParam = gender === "" ? "" : `?genders=${gender}`;
//   const url = `${API_BASE_URL}discover/carousels/top-rated/${genderParam}`;
//   const response: CarouselApiResponse = await robustFetch(url);
//   return {
//     rooms: response.rooms.map(normalizeRoomToStreamer),
//     total_count: response.rooms.length, // Carousel APIs don't provide total count
//   };
// }

// // d) Fetch Trending Rooms
// export async function getTrendingRooms(
//   gender: "f" | "m" | "c" | "t" | "" = "",
// ): Promise<ListApiResponse> {
//   const genderParam = gender === "" ? "" : `?genders=${gender}`;
//   const url = `${API_BASE_URL}discover/carousels/trending/${genderParam}`;
//   const response: CarouselApiResponse = await robustFetch(url);
//   return {
//     rooms: response.rooms.map(normalizeRoomToStreamer),
//     total_count: response.rooms.length,
//   };
// }

// This version removes the 'getFeaturedRooms' function.

export type CarouselGender = "f" | "m" | "c" | "t" | "";

export interface Streamer {
  display_age: number | null;
  gender: string;
  location: string;
  current_show: string;
  username: string;
  tags: string[];
  is_new: boolean;
  num_users: number;
  num_followers: number;
  start_dt_utc: string;
  country: string;
  is_age_verified: boolean;
  label: string;
  img: string;
  subject: string;
  is_following?: boolean;
}

interface CarouselRoom {
  room: string;
  img: string;
  gender: string;
  subject: string;
  viewers: number;
  display_age: string | null;
  country: string;
}

interface ListApiResponse {
  rooms: Streamer[];
  total_count: number;
  limit?: number;
}

interface CarouselApiResponse {
  rooms: CarouselRoom[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api/ts/';
const CHROME_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

function normalizeRoomToStreamer(room: CarouselRoom): Streamer {
  return {
    username: room.room,
    img: room.img,
    gender: room.gender,
    subject: room.subject,
    num_users: room.viewers,
    display_age: room.display_age ? parseInt(room.display_age, 10) : null,
    country: room.country,
    tags: [],
    num_followers: 0,
    is_new: false,
    is_age_verified: false,
    location: "",
    current_show: "public",
    label: "public",
    start_dt_utc: new Date().toISOString(),
  };
}

async function robustFetch(url: string): Promise<any> {
  const response = await fetch(url, { headers: CHROME_HEADERS });
  if (!response.ok)
    throw new Error(`API request failed: ${response.statusText}`);
  return response.json();
}

export async function getMostViewedRooms(
  page: number = 1,
  limit: number = 90,
): Promise<ListApiResponse> {
  const offset = (page - 1) * limit;
  const url = `${API_BASE_URL}roomlist/room-list/?limit=${limit}&offset=${offset}&require_fingerprint=false`;
  const data = await robustFetch(url);
  return { ...data, limit };
}

export async function searchRooms(
  keywords: string,
  page: number = 1,
  limit: number = 99,
): Promise<ListApiResponse> {
  const offset = (page - 1) * limit;
  const url = `${API_BASE_URL}roomlist/room-list/?keywords=${encodeURIComponent(keywords)}&limit=${limit}&offset=${offset}&require_fingerprint=false`;
  const data = await robustFetch(url);
  return { ...data, limit };
}

export async function getTopRatedRooms(
  gender: CarouselGender = "",
): Promise<ListApiResponse> {
  const genderParam = gender === "" ? "" : `?genders=${gender}`;
  const url = `${API_BASE_URL}discover/carousels/top-rated/${genderParam}`;
  const response: CarouselApiResponse = await robustFetch(url);
  return {
    rooms: response.rooms.map(normalizeRoomToStreamer),
    total_count: response.rooms.length,
    limit: response.rooms.length,
  };
}

export async function getTrendingRooms(
  gender: CarouselGender = "",
): Promise<ListApiResponse> {
  const genderParam = gender === "" ? "" : `?genders=${gender}`;
  const url = `${API_BASE_URL}discover/carousels/trending/${genderParam}`;
  const response: CarouselApiResponse = await robustFetch(url);
  return {
    rooms: response.rooms.map(normalizeRoomToStreamer),
    total_count: response.rooms.length,
    limit: response.rooms.length,
  };
}
