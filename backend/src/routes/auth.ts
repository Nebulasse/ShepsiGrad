import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getProfile } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = Router();

// Валидация для регистрации
const registerValidation = [
  body('email').isEmail().withMessage('Введите корректный email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен быть не менее 6 символов'),
  body('firstName').notEmpty().withMessage('Введите имя'),
  body('lastName').notEmpty().withMessage('Введите фамилию')
];

// Валидация для входа
const loginValidation = [
  body('email').isEmail().withMessage('Введите корректный email'),
  body('password').notEmpty().withMessage('Введите пароль')
];

// Маршруты
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', auth, getProfile);

export default router; 