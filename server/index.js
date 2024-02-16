import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import nftsRoutes from './routes/nfts.js';
import usersRoutes from './routes/users.js';
import nftTracker from './nftTracker.js';
import metadataRoutes from './routes/metadata.js'
import verifyJWT from './middleware/verifyJWT.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app); 
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'],
    credentials: true,
  }
});
const PORT = 5000;
const imagesPath = path.join(__dirname, 'nftImages');


app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000' , credentials: true,}));
   

app.use('/users', usersRoutes);     
app.use('/nfts', nftsRoutes);
app.use('/metadata', metadataRoutes);     
app.use('/images', express.static(imagesPath));

app.get('/', (req, rsp) => {
    console.log('Test!');
    rsp.send("Hello from Homepage.");
})


server.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
  
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });



nftTracker();



export default io;
