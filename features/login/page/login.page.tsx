"use client";

import React from "react";
import { LoginForm } from "@/features/login/component/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-card">
        <div className="max-w-md mx-auto w-full px-6">
          <div className="flex items-center gap-2 mb-16">
            <span className="text-xl font-semibold text-foreground">
              Docflow Pro
            </span>
          </div>

          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Xush kelibsiz
              </h1>
              <p className="text-muted-foreground">
                Hisobingizga kirish uchun username va parolingizni kiriting.
              </p>
            </div>

            <LoginForm />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Copyright © 2025 Nordic IT LTD.
        </div>
      </div>

      {/* Right Side - Promotional Content */}
      <div className="flex-1 bg-primary max-lg:hidden p-8 flex flex-col justify-center text-primary-foreground relative overflow-hidden">
        <div className="max-w-lg mx-auto space-y-6 z-10">
          <div className="space-y-4">
            <h2 className="text-4xl  text-text-on-dark font-bold leading-tight">
              Hujjat aylanishini oson boshqaring.
            </h2>
            <p className="text-text-on-dark text-lg">
              Hujjatlar boshqaruvi tizimiga kiring va fayl aylanishini nazorat
              qiling.
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20">
            <div className="bg-card rounded-xl p-4 shadow-custom-xl">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="text-primary text-sm font-medium">
                      Jami hujjatlar
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      1,847
                    </div>
                    <div className="text-success text-xs">
                      +15% o'tgan oydan
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-muted-foreground text-sm">
                      Jarayon vaqti
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      02:45:12
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-muted-foreground text-sm">
                      Fayl aylanishi
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Haftalik
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-20 bg-surface-primary rounded-lg flex items-end justify-center">
                  <div className="flex items-end space-x-1 h-full py-2">
                    <div
                      className="w-2 bg-primary/60 rounded-t"
                      style={{ height: "60%" }}
                    ></div>
                    <div
                      className="w-2 bg-primary/80 rounded-t"
                      style={{ height: "80%" }}
                    ></div>
                    <div
                      className="w-2 bg-primary rounded-t"
                      style={{ height: "100%" }}
                    ></div>
                    <div
                      className="w-2 bg-primary/80 rounded-t"
                      style={{ height: "70%" }}
                    ></div>
                    <div
                      className="w-2 bg-primary/60 rounded-t"
                      style={{ height: "90%" }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-sm">
                      Tasdiqlangan
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      1,284
                    </div>
                    <div className="text-success text-xs">+12%</div>
                  </div>
                  <div className="w-24 h-24 relative">
                    <div className="w-full h-full rounded-full border-8 border-muted relative">
                      <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent transform rotate-45"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold text-foreground">
                            563
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Fayllar
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction list */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    So'nggi hujjatlar
                  </div>
                  <div className="space-y-1">
                    {[
                      {
                        id: "DOC-001",
                        name: "Shartnoma.pdf",
                        status: "Tasdiqlandi",
                        color: "success",
                      },
                      {
                        id: "DOC-002",
                        name: "Hisobot.docx",
                        status: "Ko'rib chiqilmoqda",
                        color: "warning",
                      },
                      {
                        id: "DOC-003",
                        name: "Buyruq.pdf",
                        status: "Imzolandi",
                        color: "info",
                      },
                      {
                        id: "DOC-004",
                        name: "Ariza.docx",
                        status: "Yangi",
                        color: "primary",
                      },
                    ].map((doc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 bg-${doc.color} rounded-full`}
                          ></div>
                          <div className="text-xs text-muted-foreground">
                            {doc.id}
                          </div>
                          <div className="text-xs text-foreground">
                            {doc.name}
                          </div>
                        </div>
                        <div
                          className={`text-xs text-${doc.color} font-medium`}
                        >
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

        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-foreground rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-foreground rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
