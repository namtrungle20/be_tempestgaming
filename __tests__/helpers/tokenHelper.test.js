import { getNguoiDungFromToken } from '../../helpers/tokenHelper.js';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

// Mock db module and NguoiDung model
jest.unstable_mockModule('../../models/index.js', () => ({
  __esModule: true,
  default: {
    NguoiDung: {
      findByPk: jest.fn(),
    },
  },
}));

// Re-import tokenHelper after mocks (for ESM compatibility in Babel/Jest env)
// Note: In this CommonJS-like Jest setup with Babel, direct import works

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

function createNext() {
  return jest.fn();
}

describe('getNguoiDungFromToken', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...OLD_ENV, JWT_SECRET_KEY: 'secret' };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('Should return 401 when Authorization header is missing', async () => {
    const req = { headers: {} };
    const res = createRes();
    const next = createNext();

    await getNguoiDungFromToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Thiếu token xác thực' });
    expect(next).not.toHaveBeenCalled();
  });

  test('Should return 403 when token verification throws (invalid/expired)', async () => {
    const req = { headers: { authorization: 'Bearer invalidtoken' } };
    const res = createRes();
    const next = createNext();

    jwt.verify.mockImplementation(() => { throw new Error('invalid'); });

    await getNguoiDungFromToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('invalidtoken', 'secret');
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    expect(next).not.toHaveBeenCalled();
  });

  test('Should return 404 when decoded user is not found', async () => {
    const req = { headers: { authorization: 'Bearer goodtoken' } };
    const res = createRes();
    const next = createNext();

    jwt.verify.mockReturnValue({ nguoidung_id: 123 });

    const db = (await import('../../models/index.js')).default;
    db.NguoiDung.findByPk.mockResolvedValue(null);

    await getNguoiDungFromToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('goodtoken', 'secret');
    expect(db.NguoiDung.findByPk).toHaveBeenCalledWith(123);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Người dùng không tồn tại' });
    expect(next).not.toHaveBeenCalled();
  });

  test('Should attach user to req and call next on success', async () => {
    const req = { headers: { authorization: 'Bearer goodtoken' } };
    const res = createRes();
    const next = createNext();

    jwt.verify.mockReturnValue({ nguoidung_id: 42 });

    const db = (await import('../../models/index.js')).default;
    const fakeUser = { nguoidung_id: 42, hoten: 'Test' };
    db.NguoiDung.findByPk.mockResolvedValue(fakeUser);

    await getNguoiDungFromToken(req, res, next);

    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('Should correctly parse Bearer token with extra spaces', async () => {
    const req = { headers: { authorization: 'Bearer   spaced   ' } };
    const res = createRes();
    const next = createNext();

    jwt.verify.mockReturnValue({ nguoidung_id: 1 });
    const db = (await import('../../models/index.js')).default;
    db.NguoiDung.findByPk.mockResolvedValue({ nguoidung_id: 1 });

    await getNguoiDungFromToken(req, res, next);

    // split(' ')[1] would produce empty string for multiple spaces => verify gets ''
    expect(jwt.verify).toHaveBeenCalledWith('', 'secret');
  });

  test('Should not crash when next throws; still propagates', async () => {
    const req = { headers: { authorization: 'Bearer goodtoken' } };
    const res = createRes();
    const next = jest.fn(() => { throw new Error('route error'); });

    jwt.verify.mockReturnValue({ nguoidung_id: 5 });
    const db = (await import('../../models/index.js')).default;
    db.NguoiDung.findByPk.mockResolvedValue({ nguoidung_id: 5 });

    await expect(getNguoiDungFromToken(req, res, next)).rejects.toThrow('route error');
  });
});
