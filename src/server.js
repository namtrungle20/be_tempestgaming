import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import db from "./models/index.js"
import os from 'os'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import { AppRoute } from './AppRoute.js'
import path from 'path';


const app = express()
const port = process.env.PORT;

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Origin',
    'X-Requested-With',
    'Accept',
    'ngrok-skip-browser-warning'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.options('/{*path}', cors());

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval'; img-src * data: blob:;");
  next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(import.meta.dirname, 'uploads')));

app.get('/', (req, res) => {
  const filePath = path.join(process.cwd(), 'index.html');
  res.sendFile(filePath);
});


app.get('/api/health', async (req, res) => {
  try {
    await db.sequelize.authenticate(); // kiểm tra kết nối DB

    const cpuLoad = os.loadavg();
    const memoryUsage = process.memoryUsage();
    const cpus = os.cpus();

    const cpuPercentage = cpuLoad[0] / cpus.length * 100;
    res.status(200).json({
      status: 'OK',
      message: 'Đã Kết Nối',
      cpuLoad: {
        oneMinute: cpuLoad[0].toFixed(2),
        fiveMinutes: cpuLoad[1].toFixed(2),
        fifteenMinutes: cpuLoad[2].toFixed(2),
        percentage: cpuPercentage.toFixed(2) + '%'

      },
      memoryUsage: {
        rss: (memoryUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
        heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
        heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
        external: (memoryUsage.external / 1024 / 1024).toFixed(2) + ' MB'

      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'FAIL',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

AppRoute(app)


const server = http.createServer(app)

export const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  }
})

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id)

  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`)
  })

  socket.on('join-admin', () => {
    socket.join('admin-room')
  })

  socket.on('join-product', (sanpham_id) => {
    socket.join(`product-${sanpham_id}`)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id)
  })
})

// ── Listen bằng server thay vì app ────────────────────────────────────────
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
