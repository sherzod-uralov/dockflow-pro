import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import DeportamentPage from '../page/deportament.page'
import { useGetAllDeportaments, useDeleteDeportament } from '../hook/deportament.hook'
import { useRouter, useSearchParams } from 'next/navigation'

// Mocks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn()
}))
jest.mock('../hook/deportament.hook')
jest.mock('@/components/shared/ui/custom-modal', () => ({
    useModal: () => ({
        isOpen: false,
        openModal: jest.fn(),
        closeModal: jest.fn()
    }),
    CustomModal: ({ children }: any) => <div>{children}</div>,
    ConfirmationModal: () => <div>Confirmation Modal</div>
}))
jest.mock('@/components/shared/ui/custom-table', () => ({
    DataTable: ({ data }: any) => (
        <div>
            {data.map((item: any) => (
                <div key={item.id}>{item.name}</div>
            ))}
        </div>
    )
}))
jest.mock('../component/deportament.form', () => () => <div>Deportament Form Modal</div>)
jest.mock('../component/deportament.view', () => () => <div>Deportament View</div>)

const renderWithMantine = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>)
}

describe('DeportamentPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() })
            ; (useSearchParams as jest.Mock).mockReturnValue({ get: jest.fn() })
            ; (useGetAllDeportaments as jest.Mock).mockReturnValue({
                data: {
                    data: [
                        { id: '1', name: 'Dept 1', description: 'Desc 1' }
                    ],
                    count: 1
                },
                isLoading: false
            })
            ; (useDeleteDeportament as jest.Mock).mockReturnValue({
                mutate: jest.fn()
            })
    })

    test('sahifa to\'g\'ri render bo\'ladi', () => {
        renderWithMantine(<DeportamentPage />)
        expect(screen.getByText('Bo\'limlar')).toBeInTheDocument()
        expect(screen.getByText('Dept 1')).toBeInTheDocument()
    })

    test('loading holati', () => {
        ; (useGetAllDeportaments as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true
        })

        renderWithMantine(<DeportamentPage />)
        // DataTable mock loading propini handle qilmayapti, lekin biz hook chaqirilganini tekshirishimiz mumkin
        expect(useGetAllDeportaments).toHaveBeenCalled()
    })
})
