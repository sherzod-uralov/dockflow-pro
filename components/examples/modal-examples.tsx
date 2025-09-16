"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  CustomModal,
  useModal,
  ConfirmationModal,
  InfoModal
} from "@/components/ui/custom-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Edit, Info, Plus, Save } from "lucide-react"

export function ModalExamples() {
  // Basic modal hooks
  const basicModal = useModal()
  const formModal = useModal()
  const confirmModal = useModal()
  const infoModal = useModal()
  const largeModal = useModal()

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    message: ""
  })

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    formModal.closeModal()
    // Reset form
    setFormData({ name: "", email: "", message: "" })
  }

  const handleDelete = () => {
    console.log("Item deleted!")
    // Delete logic here
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Custom Modal Examples</h1>

      {/* Basic Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Modal Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={basicModal.openModal}>
              <Info className="w-4 h-4 mr-2" />
              Basic Modal
            </Button>

            <Button onClick={formModal.openModal} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Form Modal
            </Button>

            <Button onClick={confirmModal.openModal} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Confirmation Modal
            </Button>

            <Button onClick={infoModal.openModal} variant="secondary">
              <Info className="w-4 h-4 mr-2" />
              Info Modal
            </Button>

            <Button onClick={largeModal.openModal}>
              <Edit className="w-4 h-4 mr-2" />
              Large Modal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Basic Modal */}
      <CustomModal
        isOpen={basicModal.isOpen}
        onClose={basicModal.closeModal}
        title="Basic Modal"
        description="Bu oddiy modal oyna misoli"
        size="md"
      >
        <div className="space-y-4">
          <p>Bu basic modal component. Uni turli maqsadlarda ishlatishingiz mumkin.</p>
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold">Xususiyatlari:</h4>
            <ul className="list-disc list-inside mt-2 text-sm space-y-1">
              <li>Responsive dizayn</li>
              <li>Keyboard navigation</li>
              <li>Focus management</li>
              <li>Accessible</li>
            </ul>
          </div>
        </div>
      </CustomModal>

      {/* Form Modal */}
      <CustomModal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
        title="Yangi Xabar"
        description="Quyidagi formani to'ldiring"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={formModal.closeModal}>
              Bekor qilish
            </Button>
            <Button form="message-form" type="submit">
              <Save className="w-4 h-4 mr-2" />
              Saqlash
            </Button>
          </div>
        }
      >
        <form id="message-form" onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ism</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ismingizni kiriting"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Xabar</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Xabaringizni yozing..."
              rows={4}
              required
            />
          </div>
        </form>
      </CustomModal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.closeModal}
        onConfirm={handleDelete}
        title="O'chirish tasdiqi"
        description="Bu elementni o'chirishni xohlaysizmi? Bu amalni ortga qaytarib bo'lmaydi."
        confirmText="O'chirish"
        cancelText="Bekor qilish"
        variant="destructive"
      />

      {/* Info Modal */}
      <InfoModal
        isOpen={infoModal.isOpen}
        onClose={infoModal.closeModal}
        title="Ma'lumot"
        size="md"
      >
        <div className="space-y-4">
          <p>Bu ma'lumot modali. Foydalanuvchilarga muhim ma'lumotlarni ko'rsatish uchun ishlatiladi.</p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900">Muhim!</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Bu ma'lumot sizning ishingiz uchun muhim bo'lishi mumkin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </InfoModal>

      {/* Large Modal */}
      <CustomModal
        isOpen={largeModal.isOpen}
        onClose={largeModal.closeModal}
        title="Katta Modal"
        description="Bu katta modal oyna misoli"
        size="xl"
        closeOnOverlayClick={false}
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Content Sections</h3>

            {Array.from({ length: 3 }, (_, i) => (
              <Card key={i} className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base">Bo'lim {i + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Bu {i + 1}-bo'lim uchun content. Katta modallarda ko'p ma'lumot
                    ko'rsatishingiz mumkin. Scroll avtomatik tarzda ishlaydi.
                  </p>

                  {i === 1 && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="bg-muted p-3 rounded">
                        <h5 className="font-medium">Statistika 1</h5>
                        <p className="text-2xl font-bold text-primary">1,234</p>
                      </div>
                      <div className="bg-muted p-3 rounded">
                        <h5 className="font-medium">Statistika 2</h5>
                        <p className="text-2xl font-bold text-primary">5,678</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="border-t pt-4">
            <Button onClick={largeModal.closeModal} className="w-full">
              Yopish
            </Button>
          </div>
        </div>
      </CustomModal>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Foydalanish ko'rsatmalari</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Basic Usage:</h4>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`import { CustomModal, useModal } from '@/components/ui/custom-modal'

const modal = useModal()

<CustomModal
  isOpen={modal.isOpen}
  onClose={modal.closeModal}
  title="Title"
  size="md"
>
  Content here...
</CustomModal>`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. Confirmation Modal:</h4>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<ConfirmationModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleConfirm}
  title="Delete Item"
  variant="destructive"
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. Available Sizes:</h4>
            <p className="text-sm text-muted-foreground">
              <code>sm</code>, <code>md</code>, <code>lg</code>, <code>xl</code>, <code>full</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ModalExamples
