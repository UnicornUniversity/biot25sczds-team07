import { initializeApp } from './app';

const port = 8080;

initializeApp().then((app) => {
    app.listen(port, () => {
        console.log(`Server started at http://localhost:${port}`);
    });
}).catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
});