import express from 'express';
import { forgotPassword, index, logout, resetPassword, signin, signup } from '../Controller/Users.Controllers.js';

export const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/signin', signin);
userRouter.get('/logout', logout);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);

