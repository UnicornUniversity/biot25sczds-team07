import { initializeApp } from './app';

const port = process.env.PORT || 8000;

initializeApp().then((app) => {
    app.listen(port, () => {
        console.log(`Server started at http://localhost:${port}`);
    });
}).catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
});