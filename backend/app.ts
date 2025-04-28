import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';
import 'dotenv/config';

import userRouter from './src/routes/userRouter';
import organisationRouter from './src/routes/organisationRouter';
import measurementPoinRouter from './src/routes/measurementPointRouter';

import { connectToDatabase } from './src/services/database.service';
import measuringRouter from './src/routes/measuringRouter';
import sensorRouter from './src/routes/sensorRouter';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/user', userRouter);
app.use('/organisation', organisationRouter);
app.use('/measurementPoint', measurementPoinRouter);
app.use('/measuring', measuringRouter);
app.use("/sensor", sensorRouter)

// app/user/add 


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({ error: 'Internal Server Error' });
// });

export const initializeApp = async () => {
    await connectToDatabase();
    return app;
};

export default app;