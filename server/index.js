import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';  
import crypto from 'crypto';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const COINBASE_WS_URL = 'wss://ws-feed.exchange.coinbase.com';
const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY.replace(/\\n/g, '\n'); 
const SIGNATURE_PATH = '/users/self/verify';

// Store active subscriptions and WebSocket connections
const subscriptions = new Map();
const wsConnections = new Map();

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST'],
  credentials: true 
}));

app.use(express.json());

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Mock authentication
  if (password === 'password123') {
    const token = jwt.sign({ username }, process.env.JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Signature
const generateSignature = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const message = `${timestamp}GET${SIGNATURE_PATH}`;
  
  const hmacKey = Buffer.from(SECRET_KEY, 'base64');
  const signature = crypto
    .createHmac('sha256', hmacKey)
    .update(message)
    .digest('base64')
    .trim();  
  
  return { signature, timestamp };
};

// WebSocket connection handler
io.on('connection', async (socket) => {
  const userId = socket.handshake.auth.token;
  console.log('Client connected', userId);
  const { signature, timestamp } = await generateSignature();
  let ws = wsConnections.get(userId);

    // Initialize user's subscriptions if not exists
    if (!subscriptions.has(userId)) {
      subscriptions.set(userId, new Set());
    }

  const setupWebSocket = (subscribeMessage) => {
    if (!ws || ws.readyState === WebSocket.CLOSED) {
      const webSocket = new WebSocket(COINBASE_WS_URL);
      wsConnections.set(userId, webSocket);

      webSocket.on('message', (data) => {
        const message = JSON.parse(data.toString());
        socket.emit('update', message);
      });

      webSocket.on('open', () => {
        // Resubscribe to all products if reconnecting
        const userSubs = subscriptions.get(userId);
        if (userSubs && userSubs.size > 0) {
          webSocket.send(JSON.stringify(subscribeMessage));
        }
      });

      webSocket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    }
    return ws;
  }
  // Send current subscriptions status
  const sendUpdates = (userSubs, channels)=> socket.emit('update', {
      type: 'subscriptions',
      channels: [
        { name: channels, product_ids: Array.from(userSubs) }
      ]
    });

  socket.on('subscribe',  ({ products, channels }) => {
    
    const userSubs = subscriptions.get(userId);
    const productsToSubscribe = products.filter(p => !userSubs.has(p));
    
    if (productsToSubscribe.length > 0) {
      productsToSubscribe.forEach(p => userSubs.add(p));
      try {
        const subscribeMessage = {
          type: 'subscribe',
          product_ids: productsToSubscribe,
          channels: channels,
          signature: signature,
          key: API_KEY,
          timestamp: timestamp
        }
        const ws = setupWebSocket(subscribeMessage);
        
      } catch (error) {
        console.error('Error in subscribe:', error);
      }
    }
    
    sendUpdates(userSubs, channels)
  });


  socket.on('unsubscribe', ({ products, channels }) => {
    const userSubs = subscriptions.get(userId);
    const productsToUnsubscribe = products.filter(p => userSubs.has(p));
    
    if (productsToUnsubscribe.length > 0) {
      productsToUnsubscribe.forEach(p => userSubs.delete(p));
      
      try {
        const ws = wsConnections.get(userId);
        if (ws && ws.readyState === WebSocket.OPEN) {
          const unsubscribeMessage = {
            type: 'unsubscribe',
            product_ids: productsToUnsubscribe,
            channels: channels //['level2', 'matches']
          };
          ws.send(JSON.stringify(unsubscribeMessage));
        }
      } catch (error) {
        console.error('Error in unsubscribe:', error);
      }
      
      sendUpdates(userSubs, channels)
    }
  });

  socket.on('disconnect', () => {
    const ws = wsConnections.get(userId);
    if (ws) {
      ws.close();
      wsConnections.delete(userId);
      subscriptions.delete(userId);
    }
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
