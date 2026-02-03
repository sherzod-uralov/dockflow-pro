import { authService } from '../service/login.service'
import axiosInstance from '@/api/axios.instance'
import Cookies from 'js-cookie'

jest.mock('@/api/axios.instance')
jest.mock('js-cookie')

describe('authService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('login', () => {
        test('muvaffaqiyatli login va tokenlarni saqlash', async () => {
            const mockResponse = {
                data: {
                    accessToken: 'access123',
                    refreshToken: 'refresh123',
                    user: { id: '1', email: 'test@test.com', name: 'Test' }
                }
            }

                ; (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse)

            const result = await authService.login({
                username: 'testuser',
                password: 'testpass'
            })

            expect(result).toEqual(mockResponse.data)
            expect(Cookies.set).toHaveBeenCalledWith('accessToken', 'access123', expect.any(Object))
            expect(Cookies.set).toHaveBeenCalledWith('refreshToken', 'refresh123', expect.any(Object))
        })

        test('401 xatolik uchun error qaytaradi', async () => {
            const error = {
                response: { status: 401 }
            }

                ; (axiosInstance.post as jest.Mock).mockRejectedValue(error)

            await expect(
                authService.login({ username: 'wrong', password: 'wrong' })
            ).rejects.toEqual(error)

            // Tokenlar tozalanmasligi kerak
            expect(Cookies.remove).not.toHaveBeenCalled()
        })

        test('boshqa xatoliklarni qayta throw qiladi', async () => {
            const error = new Error('Network error')
                ; (axiosInstance.post as jest.Mock).mockRejectedValue(error)

            await expect(
                authService.login({ username: 'test', password: 'test' })
            ).rejects.toThrow('Network error')
        })
    })

    describe('logout', () => {
        test('tokenlarni tozalaydi', async () => {
            // Skip window.location test in jsdom
            ; (axiosInstance.post as jest.Mock).mockResolvedValue({})

            await authService.logout()

            expect(Cookies.remove).toHaveBeenCalledWith('accessToken')
            expect(Cookies.remove).toHaveBeenCalledWith('refreshToken')
            // window.location.href ni testda tekshirmaymiz chunki jsdom da navigation ishlamaydi
        })
    })

    describe('isAuthenticated', () => {
        test('token mavjud bo\'lsa true qaytaradi', () => {
            ; (Cookies.get as jest.Mock).mockReturnValue('token123')

            expect(authService.isAuthenticated()).toBe(true)
        })

        test('token bo\'lmasa false qaytaradi', () => {
            ; (Cookies.get as jest.Mock).mockReturnValue(undefined)

            expect(authService.isAuthenticated()).toBe(false)
        })
    })
})
