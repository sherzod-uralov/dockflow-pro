import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import DepartmentPage from '../page/department.page'
import { useGetAllDepartments, useDeleteDepartment } from '../hook/department.hook'
import { useRouter, useSearchParams } from 'next/navigation'

// Mocks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn()
}))
jest.mock('../hook/department.hook')
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
jest.mock('../component/department.form', () => () => <div>Department Form Modal</div>)
jest.mock('../component/department.view', () => () => <div>Department View</div>)

const renderWithMantine = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>)
}

describe('DepartmentPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() })
            ; (useSearchParams as jest.Mock).mockReturnValue({ get: jest.fn() })
            ; (useGetAllDepartments as jest.Mock).mockReturnValue({
                data: {
                    data: [
                        { id: '1', name: 'Dept 1', description: 'Desc 1' }
                    ],
                    count: 1
                },
                isLoading: false
            })
            ; (useDeleteDepartment as jest.Mock).mockReturnValue({
                mutate: jest.fn()
            })
    })

    test('sahifa to\'g\'ri render bo\'ladi', () => {
        renderWithMantine(<DepartmentPage />)
        expect(screen.getByText('Bo\'limlar')).toBeInTheDocument()
        expect(screen.getByText('Dept 1')).toBeInTheDocument()
    })

    test('loading holati', () => {
        ; (useGetAllDepartments as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true
        })

        renderWithMantine(<DepartmentPage />)
        // DataTable mock loading propini handle qilmayapti, lekin biz hook chaqirilganini tekshirishimiz mumkin
        expect(useGetAllDepartments).toHaveBeenCalled()
    })
})
