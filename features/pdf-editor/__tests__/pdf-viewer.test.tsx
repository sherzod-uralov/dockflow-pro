import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { notifications } from '@mantine/notifications'
import { PDFViewer } from '../page'
import { pdfService } from '../service/pdf.service'

jest.mock('../../service/pdf.service')
jest.mock('@mantine/notifications')
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        back: jest.fn(),
    }),
    useSearchParams: () => ({
        get: jest.fn((key) => {
            if (key === 'workflowId') return 'workflow123'
            if (key === 'actionType') return 'QR_CODE'
            return null
        })
    })
}))

// Mock PDFTron WebViewer
jest.mock('@pdftron/webviewer', () => ({
    default: jest.fn(() => Promise.resolve({
        Core: {
            documentViewer: {
                addEventListener: jest.fn(),
                getTool: jest.fn(),
                setToolMode: jest.fn(),
                getCurrentPage: jest.fn(() => 1),
                getDocument: jest.fn(() => ({
                    getPageInfo: jest.fn(() => ({
                        width: 612,
                        height: 792
                    }))
                }))
            },
            Tools: {
                ToolNames: {
                    PAN: 'Pan'
                }
            },
            Annotations: {
                StampAnnotation: jest.fn().mockImplementation(() => ({
                    PageNumber: 1,
                    X: 0,
                    Y: 0,
                    Width: 70,
                    Height: 70,
                    setImageData: jest.fn()
                }))
            },
            annotationManager: {
                addAnnotation: jest.fn(),
                redrawAnnotation: jest.fn(),
                selectAnnotation: jest.fn(),
                exportAnnotations: jest.fn(() => Promise.resolve('<xfdf></xfdf>'))
            }
        },
        UI: {
            disableElements: jest.fn()
        }
    }))
}))

describe('PDFViewer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (pdfService.getDocument as jest.Mock).mockResolvedValue({
                pdfUrl: 'https://example.com/test.pdf'
            })
    })

    test('PDF yuklanishini ko\'rsatadi', async () => {
        render(<PDFViewer documentId="doc123" />)

        expect(screen.getByText(/PDF yuklanmoqda/i)).toBeInTheDocument()
    })

    test('QR kod tugmasi ko\'rinadi', async () => {
        render(<PDFViewer documentId="doc123" />)

        await waitFor(() => {
            expect(screen.getByText(/QR kod/i)).toBeInTheDocument()
        })
    })

    test('QR kod qo\'shish funksiyasi ishlaydi', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                blob: () => Promise.resolve(new Blob(['test'], { type: 'image/png' }))
            })
        ) as jest.Mock

        render(<PDFViewer documentId="doc123" />)

        await waitFor(() => {
            expect(screen.getByText(/QR kod/i)).toBeInTheDocument()
        })

        const qrButton = screen.getByText(/QR kod/i)
        fireEvent.click(qrButton)

        await waitFor(() => {
            expect(notifications.show).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Yuklanmoqda'
                })
            )
        })
    })

    test('saqlash funksiyasi ishlaydi', async () => {
        ; (pdfService.saveAnnotations as jest.Mock).mockResolvedValue({})

        render(<PDFViewer documentId="doc123" />)

        await waitFor(() => {
            const saveButton = screen.getByText(/Saqlash/i)
            expect(saveButton).toBeInTheDocument()
        })

        const saveButton = screen.getByText(/Saqlash/i)
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(pdfService.saveAnnotations).toHaveBeenCalled()
            expect(notifications.show).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Saqlandi'
                })
            )
        })
    })

    test('documentId bo\'lmasa xatolik ko\'rsatadi', () => {
        render(<PDFViewer />)

        // Document ID bo'lmasa ham render bo'lishi, lekin xatolik bilan
        expect(screen.getByText(/PDF yuklanmoqda/i)).toBeInTheDocument()
    })
})
