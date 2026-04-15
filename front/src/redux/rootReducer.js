import { combineReducers } from "redux";
import authReducer from "./slice/auth.slice.js";
import categoryReducer from "./slice/category.slice.js";
import productReducer from "./slice/product.slice.js";

export const rootReducer = combineReducers({
    auth: authReducer,
    category: categoryReducer,
    product: productReducer,
});