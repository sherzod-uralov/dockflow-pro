import { deportamentService } from '../service/deportament.service'
import axiosInstance from '@/api/axios.instance'
import { endpoints } from '@/api/axios.endpoints'

jest.mock('@/api/axios.instance')

describe('deportamentService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getAll', () => {
        test('barcha bo\'limlarni olib keladi', async () => {
            const mockResponse = {
                data: {
                    data: [{ id: '1', name: 'IT' }],
                    total: 1
                }
            }
                ; (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse)

            const params = { search: 'test', pageNumber: 1, pageSize: 10 }
            const result = await deportamentService.getAll(params)

            expect(result).toEqual(mockResponse.data)
            expect(axiosInstance.get).toHaveBeenCalledWith(endpoints.deportament.list, {
                params: {
                    search: 'test',
                    pageNumber: 1,
                    pageSize: 10
                }
            })
        })
    })

    describe('create', () => {
        test('yangi bo\'lim yaratadi', async () => {
            const mockPayload = {
                name: 'New Dept',
                description: 'Desc',
                code: 'ND',
                location: 'Loc',
                directorId: 'user1'
            }
            const mockResponse = { data: { id: '1', ...mockPayload } }
                ; (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse)

            const result = await deportamentService.create(mockPayload)

            expect(result).toEqual(mockResponse.data)
            expect(axiosInstance.post).toHaveBeenCalledWith(endpoints.deportament.create, mockPayload)
        })
    })

    describe('update', () => {
        test('bo\'limni yangilaydi', async () => {
            const mockPayload = { name: 'Updated Dept' }
            const mockResponse = { data: { id: '1', ...mockPayload } }
                ; (axiosInstance.patch as jest.Mock).mockResolvedValue(mockResponse)

            const result = await deportamentService.update('1', mockPayload)

            expect(result).toEqual(mockResponse.data)
            expect(axiosInstance.patch).toHaveBeenCalledWith(endpoints.deportament.update('1'), mockPayload)
        })
    })

    describe('delete', () => {
        test('bo\'limni o\'chiradi', async () => {
            const mockResponse = { data: { success: true } }
                ; (axiosInstance.delete as jest.Mock).mockResolvedValue(mockResponse)

            await deportamentService.delete('1')

            expect(axiosInstance.delete).toHaveBeenCalledWith(endpoints.deportament.delete('1'))
        })
    })

    describe('getById', () => {
        test('bo\'limni ID bo\'yicha olib keladi', async () => {
            const mockResponse = { data: { id: '1', name: 'Dept' } }
                ; (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse)

            const result = await deportamentService.getById('1')

            expect(result).toEqual(mockResponse.data)
            expect(axiosInstance.get).toHaveBeenCalledWith(endpoints.deportament.detail('1'))
        })
    })
})
