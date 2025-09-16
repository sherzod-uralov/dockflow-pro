"use client";

import React from "react";
import { CustomModal, useModal } from "@/components/ui/custom-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Info, Settings, TestTube } from "lucide-react";

export default function ModalOverlayTest() {
  const normalModal = useModal();
  const noOverlayModal = useModal();
  const formModal = useModal();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Modal Overlay Click Test</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Bu sahifada modal overlay click behavior ni test qilishingiz mumkin.
          Modal ichidagi bo'sh joylarga bosganda modal yopilmasligi kerakligini tekshiring.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Test 1: Normal Modal (closes on overlay click) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test 1: Normal Modal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bu modal overlay bosilganda yopiladi, lekin ichidagi bo'sh joy bosilganda yopilmaydi.
            </p>
            <Button onClick={normalModal.openModal} className="w-full">
              Normal Modal
            </Button>
          </CardContent>
        </Card>

        {/* Test 2: No Overlay Close Modal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Test 2: No Overlay Close
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bu modal faqat close button yoki footer buttonlar bilan yopiladi.
            </p>
            <Button onClick={noOverlayModal.openModal} className="w-full" variant="outline">
              No Overlay Close
            </Button>
          </CardContent>
        </Card>

        {/* Test 3: Form Modal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Test 3: Form Modal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Form bilan modal. Form ichidagi bo'sh joylarga bosib ko'ring.
            </p>
            <Button onClick={formModal.openModal} className="w-full" variant="secondary">
              Form Modal
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Test Ko'rsatmalari</CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-700 space-y-3">
          <div>
            <h4 className="font-semibold">✅ To'g'ri behavior:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li>Modal <strong>tashqarisidagi</strong> (overlay - qora joy) bosilsa yopiladi</li>
              <li>Modal <strong>ichidagi bo'sh joy</strong> bosilsa yopilmaydi</li>
              <li>Close button (X) bosilsa yopiladi</li>
              <li>Footer buttonlar bosilsa yopiladi</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">❌ Noto'g'ri behavior:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li>Modal ichidagi bo'sh joy bosilganda yopilishi</li>
              <li>Input/button ustida bosilganda yopilishi</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Test Modal 1: Normal Modal */}
      <CustomModal
        isOpen={normalModal.isOpen}
        onClose={normalModal.closeModal}
        title="Normal Modal Test"
        description="Bu modal overlay bosilganda yopiladi"
        size="lg"
        closeOnOverlayClick={true}
      >
        <div className="space-y-6 py-4">
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-dashed border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Test Area 1</h3>
            <p className="text-blue-700 text-sm mb-4">
              Bu bo'sh joyni bosib ko'ring. Modal yopilmasligi kerak!
            </p>
            <Button size="sm">Bu button esa oddiy button</Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded border-2 border-dashed border-green-200">
              <h4 className="font-medium text-green-900">Bo'sh joy 1</h4>
              <p className="text-green-700 text-xs mt-2">Bu yerga bosib ko'ring</p>
            </div>
            <div className="bg-purple-50 p-4 rounded border-2 border-dashed border-purple-200">
              <h4 className="font-medium text-purple-900">Bo'sh joy 2</h4>
              <p className="text-purple-700 text-xs mt-2">Bu yerga ham bosib ko'ring</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Test Input</Label>
            <Input placeholder="Bu input ustiga bosganingizda modal yopilmasin" />
          </div>

          <div className="bg-red-50 p-4 rounded border border-red-200">
            <Badge variant="destructive">Diqqat</Badge>
            <p className="text-red-700 text-sm mt-2">
              Modal yopish uchun:
              <br />• Modal tashqarisidagi qora joyni bosing
              <br />• Yoki yuqoridagi X tugmasini bosing
            </p>
          </div>
        </div>
      </CustomModal>

      {/* Test Modal 2: No Overlay Close */}
      <CustomModal
        isOpen={noOverlayModal.isOpen}
        onClose={noOverlayModal.closeModal}
        title="No Overlay Close Test"
        description="Bu modal faqat buttonlar bilan yopiladi"
        size="md"
        closeOnOverlayClick={false}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={noOverlayModal.closeModal}>
              Cancel
            </Button>
            <Button onClick={noOverlayModal.closeModal}>
              OK
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-4">
          <div className="bg-amber-50 p-4 rounded border-2 border-dashed border-amber-200">
            <h4 className="font-semibold text-amber-900">Overlay Click O'chirilgan</h4>
            <p className="text-amber-700 text-sm mt-2">
              Bu modalda overlay (tashqari joy) bosilsa ham yopilmaydi.
              Faqat pastdagi buttonlar yoki X tugmasi bilan yopiladi.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm">Bu yerda bo'sh joyga bosganda ham yopilmaydi:</p>
            <div className="h-20 bg-muted rounded border-2 border-dashed flex items-center justify-center">
              <span className="text-muted-foreground">Bo'sh joy</span>
            </div>
          </div>
        </div>
      </CustomModal>

      {/* Test Modal 3: Form Modal */}
      <CustomModal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
        title="Form Modal Test"
        description="Form bilan modal test"
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={formModal.closeModal}>
              Bekor qilish
            </Button>
            <Button onClick={formModal.closeModal}>
              Saqlash
            </Button>
          </div>
        }
      >
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Ism</Label>
                <Input id="name" placeholder="Ismingizni kiriting" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" placeholder="+998 90 123 45 67" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Xabar</Label>
                <Textarea
                  id="message"
                  placeholder="Xabaringizni yozing..."
                  rows={6}
                />
              </div>
            </div>
          </div>

          {/* Large empty area for testing */}
          <div className="bg-slate-50 p-8 rounded-lg border-2 border-dashed border-slate-300">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-slate-700">Katta Bo'sh Joy</h3>
              <p className="text-slate-600 text-sm">
                Bu katta bo'sh joyga bosganda modal yopilmasligi kerak.
                Faqat modal oynasidan tashqaridagi joyga bosganda yopilsin.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="h-16 bg-white rounded border flex items-center justify-center">
                  <span className="text-xs text-slate-500">Joy 1</span>
                </div>
                <div className="h-16 bg-white rounded border flex items-center justify-center">
                  <span className="text-xs text-slate-500">Joy 2</span>
                </div>
                <div className="h-16 bg-white rounded border flex items-center justify-center">
                  <span className="text-xs text-slate-500">Joy 3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
