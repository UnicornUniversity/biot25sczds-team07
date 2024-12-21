import { initializeApp, generateToken } from '../app'; // Adjust the path as necessary
import { Server } from 'http';


let server: Server;
let token: string;

beforeAll(async () => {
    const app = await initializeApp();
    server = app.listen(8080, () => {
        console.log('Test server started on port 8080');
        const user = { id: '123', policies: ['policy1', 'policy2'] };
        token = generateToken(user);
    });
});

afterAll((done) => {
    server.close(() => {
        console.log('Test server closed');
        done();
    });
});

export { token };