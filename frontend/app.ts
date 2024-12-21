import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';
import 'dotenv/config';

import jwt from 'jsonwebtoken';

import listRouter from './src/routes/listRouter';
import itemRouter from './src/routes/organisationRouter';
import { connectToDatabase } from './src/services/database.service';

// TODO - test authorize
export const generateToken = (user: { id: string; policies: string[] }) => {
    const secretToken = process.env.ACCESS_TOKEN_SECRET;
    if (!secretToken) {
        throw new Error("Internal server error: Secret token not found");
    }

    const token = jwt.sign(
        { id: user.id, policies: user.policies },
        secretToken,
        { expiresIn: '1h' } // Token expires in 1 hour
    );

    return token;
};


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/list', listRouter);
app.use('/item', itemRouter);

app.get('/authenticate', (req, res, next) => {
    const user = { id: '123', role: 'Admin', policies: ['policy1', 'policy2'] };
    const token = generateToken(user);
    res.status(200).json({ token, errors: [] });
    // next();
});

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