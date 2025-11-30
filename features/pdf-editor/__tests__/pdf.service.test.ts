import { pdfService } from '../service/pdf.service'
import axiosInstance from '@/api/axios.instance'

jest.mock('@/api/axios.instance')

describe('pdfService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getDocument', () => {
        test('PDF URL ni qaytaradi', async () => {
            const mockResponse = {
                data: {
                    pdfUrl: 'https://example.com/test.pdf'
                }
            }

                ; (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse)

            const result = await pdfService.getDocument('doc123')

            expect(result).toEqual({ pdfUrl: 'https://example.com/test.pdf' })
            expect(axiosInstance.get).toHaveBeenCalledWith(
                expect.stringContaining('doc123')
            )
        })

        test('xatolikni handle qiladi', async () => {
            ; (axiosInstance.get as jest.Mock).mockRejectedValue(new Error('Not found'))

            await expect(pdfService.getDocument('invalid')).rejects.toThrow()
        })
    })

    describe('saveAnnotations', () => {
        test('annotatsiyalarni saqlaydi', async () => {
            const mockResponse = { data: { success: true } }
                ; (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse)

            const data = {
                documentId: 'doc123',
                xfdf: '<xfdf></xfdf>'
            }

            await pdfService.saveAnnotations(data)

            expect(axiosInstance.post).toHaveBeenCalledWith(
                expect.any(String),
                { xfdfUrl: '<xfdf></xfdf>' } // Service sends xfdfUrl, not xfdf
            )
        })
    })
})
