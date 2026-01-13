import { documentService } from '../service/document.service'
import axiosInstance from '@/api/axios.instance'
import { endpoints } from '@/api/axios.endpoints'

jest.mock('@/api/axios.instance')

describe('documentService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getAll', () => {
        test('barcha hujjatlarni olib keladi', async () => {
            const mockResponse = {
                data: {
                    data: [{ id: '1', title: 'Doc 1' }],
                    total: 1
                }
            }
                ; (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse)

            const params = {
                search: 'test',
                pageNumber: 1,
                pageSize: 10,
                status: 'PUBLISHED'
            }
            const result = await documentService.getAll(params)

            expect(result).toEqual(mockResponse.data)
            expect(axiosInstance.get).toHaveBeenCalledWith(endpoints.document.list, {
                params: {
                    search: 'test',
                    pageNumber: 1,
                    pageSize: 10,
                    status: 'PUBLISHED',
                    documentTypeId: undefined,
                    journalId: undefined,
                    priority: undefined,
                    templateId: undefined
                }
            })
        })
    })

    describe('create', () => {
        test('yangi hujjat yaratadi', async () => {
            const mockPayload = {
                title: 'New Doc',
                description: 'Desc',
                documentNumber: 'DOC-001',
                status: 'DRAFT' as const,
                documentTypeId: 'type1',
                journalId: 'journal1',
                templateId: 'temp1',
                tags: {},
                attachments: []
            }
            const mockResponse = { data: { id: '1', ...mockPayload } }
                ; (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse)

            const result = await documentService.create(mockPayload)

            expect(result).toEqual(mockResponse.data)
            expect(axiosInstance.post).toHaveBeenCalledWith(endpoints.document.create, mockPayload)
        })
    })

    describe('update', () => {
        test('hujjatni yangilaydi', async () => {
            const mockPayload = { title: 'Updated Doc' }
            const mockResponse = { data: { id: '1', ...mockPayload } }
                ; (axiosInstance.patch as jest.Mock).mockResolvedValue(mockResponse)

            const result = await documentService.update('1', mockPayload)

            expect(result).toEqual(mockResponse.data)
            expect(axiosInstance.patch).toHaveBeenCalledWith(endpoints.document.update('1'), mockPayload)
        })
    })

    describe('delete', () => {
        test('hujjatni o\'chiradi', async () => {
            const mockResponse = { data: { success: true } }
                ; (axiosInstance.delete as jest.Mock).mockResolvedValue(mockResponse)

            await documentService.delete('1')

            expect(axiosInstance.delete).toHaveBeenCalledWith(endpoints.document.delete('1'))
        })
    })

    describe('getById', () => {
        test('hujjatni ID bo\'yicha olib keladi', async () => {
            const mockResponse = { data: { id: '1', title: 'Doc 1' } }
                ; (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse)

            const result = await documentService.getById('1')

            expect(result).toEqual(mockResponse.data)
            expect(axiosInstance.get).toHaveBeenCalledWith(endpoints.document.detail('1'))
        })
    })
})
