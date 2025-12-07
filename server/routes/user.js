const express = require("express");

const isAuthenticated = require("../middlewares/auth");
const { getAllUserUrls, deleteUserUrls } = require("../controller/user");

const userRouter = new express.Router();

// API endpoint to get all url's shortened by user
userRouter.get("/api/v1/user/:id", isAuthenticated, getAllUserUrls);

// API endpoint to delete url by user
userRouter.delete("/api/v1/user/:id", isAuthenticated, deleteUserUrls);

module.exports = userRouter;
