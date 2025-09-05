"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/features/login/component/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 flex flex-col items-center justify-center bg-white">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
            </div>
            <span className="text-xl font-semibold text-gray-900">
              Docflow Pro
            </span>
          </div>

          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Xush kelibsiz
              </h1>
              <p className="text-gray-600">
                Hisobingizga kirish uchun username va parolingizni kiriting.
              </p>
            </div>
            <LoginForm />
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-500">
                    Yoki boshqa usul bilan kirish
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-12 border-gray-300 hover:bg-gray-50 bg-transparent flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="h-12 border-gray-300 hover:bg-gray-50 bg-transparent flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Apple
                </Button>
              </div>
            </div>

            <div className="text-center">
              <span className="text-gray-600">Hisobingiz yo'qmi? </span>
              <a
                href="#"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Ro'yxatdan o'ting.
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          Copyright © 2025 Docflow Pro Enterprises LTD.
        </div>
      </div>

      {/* Right Side - Promotional Content */}
      <div className="flex-1 bg-primary max-lg:hidden  p-8 flex flex-col justify-center text-white relative overflow-hidden">
        <div className="max-w-lg mx-auto space-y-6 z-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Hujjat aylanishini oson boshqaring.
            </h2>
            <p className="text-blue-100 text-lg">
              Hujjatlar boshqaruvi tizimiga kiring va fayl aylanishini nazorat
              qiling.
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="bg-white rounded-xl p-4 shadow-2xl">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="text-blue-600 text-sm font-medium">
                      Jami hujjatlar
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      1,847
                    </div>
                    <div className="text-green-600 text-xs">
                      +15% o'tgan oydan
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-gray-600 text-sm">Jarayon vaqti</div>
                    <div className="text-xl font-bold text-gray-900">
                      02:45:12
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-gray-600 text-sm">Fayl aylanishi</div>
                    <div className="text-sm text-gray-500">Haftalik</div>
                  </div>
                </div>
                <div className="h-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-end justify-center">
                  <div className="flex items-end space-x-1 h-full py-2">
                    <div
                      className="w-2 bg-blue-400 rounded-t"
                      style={{ height: "60%" }}
                    ></div>
                    <div
                      className="w-2 bg-blue-500 rounded-t"
                      style={{ height: "80%" }}
                    ></div>
                    <div
                      className="w-2 bg-blue-600 rounded-t"
                      style={{ height: "100%" }}
                    ></div>
                    <div
                      className="w-2 bg-blue-500 rounded-t"
                      style={{ height: "70%" }}
                    ></div>
                    <div
                      className="w-2 bg-blue-400 rounded-t"
                      style={{ height: "90%" }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-gray-600 text-sm">Tasdiqlangan</div>
                    <div className="text-xl font-bold text-gray-900">1,284</div>
                    <div className="text-green-600 text-xs">+12%</div>
                  </div>
                  <div className="w-24 h-24 relative">
                    <div className="w-full h-full rounded-full border-8 border-blue-100 relative">
                      <div className="absolute inset-0 rounded-full border-8 border-blue-600 border-t-transparent transform rotate-45"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">
                            563
                          </div>
                          <div className="text-xs text-gray-600">Fayllar</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction list */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-900">
                    So'nggi hujjatlar
                  </div>
                  <div className="space-y-1">
                    {[
                      {
                        id: "DOC-001",
                        name: "Shartnoma.pdf",
                        status: "Tasdiqlandi",
                      },
                      {
                        id: "DOC-002",
                        name: "Hisobot.docx",
                        status: "Ko'rib chiqilmoqda",
                      },
                      {
                        id: "DOC-003",
                        name: "Buyruq.pdf",
                        status: "Imzolandi",
                      },
                      { id: "DOC-004", name: "Ariza.docx", status: "Yangi" },
                    ].map((doc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="text-xs text-gray-600">{doc.id}</div>
                          <div className="text-xs text-gray-800">
                            {doc.name}
                          </div>
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          {doc.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
